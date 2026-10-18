from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.receipt import Receipt, ReceiptStatus
from src.models.bank_transaction import BankTransaction
from src.models.tenant import Tenant
from pydantic import BaseModel

router = APIRouter()


class CashSummaryResponse(BaseModel):
    currentBalance: float
    inflowToday: float
    outflowToday: float
    automationRate: float
    activeAlertsCount: int
    reconciledCount: int


class RedAlertItemResponse(BaseModel):
    id: str
    receiptId: str
    originalFileName: str
    recipient: str
    amount: float
    date: str
    divergenceReason: str
    confidence: float
    fileUrl: Optional[str] = None
    actionPrompt: Optional[str] = "Confirmação do próprio cliente em 1 clique (sem suporte interno)."
    autoResolutionReady: bool = True


class ResolveAlertRequest(BaseModel):
    receiptId: str
    action: str  # "MATCH_TRANSACTION", "UPDATE_AMOUNT", "DISCARD"
    selectedTransactionId: Optional[str] = None
    correctedAmount: Optional[float] = None
    correctedCategory: Optional[str] = None


def get_default_tenant(db: Session) -> Tenant:
    tenant = db.query(Tenant).first()
    if not tenant:
        tenant = Tenant(
            name="Microempresa Demonstração BPO",
            cnpj_cpf="12.345.678/0001-90",
            subscription_plan="Plano BPO Micro Pro",
            is_active=True,
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
    return tenant


@router.get("/summary", response_model=CashSummaryResponse)
def get_conciliation_summary(db: Session = Depends(get_db)):
    """Retorna a visão 360 do caixa e indicadores da IA para o dashboard."""
    tenant = get_default_tenant(db)

    # Contagem de comprovantes
    total_receipts = db.query(Receipt).filter(Receipt.tenant_id == tenant.id).count()
    auto_reconciled = (
        db.query(Receipt)
        .filter(
            Receipt.tenant_id == tenant.id,
            Receipt.status == ReceiptStatus.AUTO_RECONCILED.value,
        )
        .count()
    )
    red_alerts = (
        db.query(Receipt)
        .filter(
            Receipt.tenant_id == tenant.id,
            Receipt.status == ReceiptStatus.CLIENT_CONFIRMATION_REQUIRED.value,
        )
        .count()
    )

    automation_rate = (
        (auto_reconciled / total_receipts) if total_receipts > 0 else 0.92
    )

    # Cálculo dos lançamentos do dia
    txs = db.query(BankTransaction).filter(BankTransaction.tenant_id == tenant.id).all()
    inflow = sum(tx.amount for tx in txs if tx.amount > 0)
    outflow = sum(abs(tx.amount) for tx in txs if tx.amount < 0)

    # Base de saldo
    base_balance = 14850.20 + inflow - outflow

    return CashSummaryResponse(
        currentBalance=base_balance,
        inflowToday=inflow if inflow > 0 else 3200.0,
        outflowToday=outflow if outflow > 0 else 1150.0,
        automationRate=round(automation_rate, 2),
        activeAlertsCount=red_alerts,
        reconciledCount=auto_reconciled,
    )


@router.get("/alerts", response_model=List[RedAlertItemResponse])
def get_red_alerts(db: Session = Depends(get_db)):
    """Retorna as notificações inteligentes de auto-resolução para confirmação direta do próprio cliente (sem fila de suporte interno)."""
    tenant = get_default_tenant(db)
    alerts = (
        db.query(Receipt)
        .filter(
            Receipt.tenant_id == tenant.id,
            Receipt.status == ReceiptStatus.CLIENT_CONFIRMATION_REQUIRED.value,
        )
        .order_by(Receipt.uploaded_at.desc())
        .all()
    )

    return [
        RedAlertItemResponse(
            id=f"alert-{r.id}",
            receiptId=r.id,
            originalFileName=r.original_file_name,
            recipient=r.extracted_recipient or "Favorecido Desconhecido",
            amount=r.extracted_amount or 0.0,
            date=r.extracted_date or "",
            divergenceReason=r.divergence_reason or "Sugestão de ajuste formulada pela IA aguardando confirmação em 1 clique.",
            confidence=r.ai_confidence_score or 0.0,
            fileUrl=r.file_url,
            actionPrompt="Aprovar auto-resolução em 1 clique na sua tela.",
            autoResolutionReady=True,
        )
        for r in alerts
    ]


@router.post("/resolve")
def resolve_red_alert(request: ResolveAlertRequest, db: Session = Depends(get_db)):
    """Registra a confirmação em 1 clique realizada diretamente pelo próprio cliente na tela dele."""
    receipt = db.query(Receipt).filter(Receipt.id == request.receiptId).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Comprovante não encontrado")

    if request.action == "MATCH_TRANSACTION" and request.selectedTransactionId:
        tx = db.query(BankTransaction).filter(BankTransaction.id == request.selectedTransactionId).first()
        if tx:
            tx.is_reconciled = True
            tx.matched_receipt_id = receipt.id
            receipt.matched_transaction_id = tx.id
            receipt.status = ReceiptStatus.CLIENT_CONFIRMED.value
            receipt.divergence_reason = None

    elif request.action == "UPDATE_AMOUNT" and request.correctedAmount is not None:
        receipt.extracted_amount = request.correctedAmount
        if request.correctedCategory:
            receipt.category = request.correctedCategory
        receipt.status = ReceiptStatus.CLIENT_CONFIRMED.value
        receipt.divergence_reason = None

    elif request.action == "DISCARD":
        receipt.status = ReceiptStatus.DISCARDED.value

    db.commit()
    return {"status": "success", "receipt_id": receipt.id, "new_status": receipt.status}
