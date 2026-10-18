from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.bank_transaction import BankTransaction
from src.models.tenant import Tenant
from pydantic import BaseModel

router = APIRouter()


class BankTransactionResponse(BaseModel):
    id: str
    bankName: str
    date: str
    description: str
    amount: float
    transactionType: str
    isReconciled: bool
    matchedReceiptId: Optional[str] = None

    class Config:
        from_attributes = True


class CreateTransactionRequest(BaseModel):
    bankName: str
    date: str
    description: str
    amount: float
    transactionType: str  # "INFLOW" ou "OUTFLOW"


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


@router.get("/", response_model=List[BankTransactionResponse])
def list_bank_transactions(
    limit: int = 100,
    only_unreconciled: bool = False,
    db: Session = Depends(get_db),
):
    """Lista as transações do extrato bancário."""
    tenant = get_default_tenant(db)
    query = db.query(BankTransaction).filter(BankTransaction.tenant_id == tenant.id)

    if only_unreconciled:
        query = query.filter(BankTransaction.is_reconciled == False)

    txs = query.order_by(BankTransaction.date.desc()).limit(limit).all()

    return [
        BankTransactionResponse(
            id=t.id,
            bankName=t.bank_name,
            date=t.date,
            description=t.description,
            amount=t.amount,
            transactionType=t.transaction_type,
            isReconciled=t.is_reconciled,
            matchedReceiptId=t.matched_receipt_id,
        )
        for t in txs
    ]


@router.post("/", response_model=BankTransactionResponse)
def create_bank_transaction(
    payload: CreateTransactionRequest, db: Session = Depends(get_db)
):
    """Cadastra um lançamento avulso no extrato."""
    tenant = get_default_tenant(db)
    tx = BankTransaction(
        tenant_id=tenant.id,
        bank_name=payload.bankName,
        date=payload.date,
        description=payload.description,
        amount=payload.amount,
        transaction_type=payload.transactionType,
        is_reconciled=False,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    return BankTransactionResponse(
        id=tx.id,
        bankName=tx.bank_name,
        date=tx.date,
        description=tx.description,
        amount=tx.amount,
        transactionType=tx.transaction_type,
        isReconciled=tx.is_reconciled,
        matchedReceiptId=tx.matched_receipt_id,
    )
