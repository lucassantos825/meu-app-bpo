from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.receipt import Receipt, ReceiptStatus
from src.models.tenant import Tenant
from src.services.storage.storage_service import storage_service
from src.services.ai.ocr_extractor import ocr_extractor_service
from src.services.conciliation.matcher import conciliation_matcher_service
from pydantic import BaseModel

router = APIRouter()


class ReceiptResponse(BaseModel):
    id: str
    amount: float
    date: str
    recipient: str
    cnpjCpf: Optional[str]
    category: str
    bankAccount: str
    confidence: float
    matchStatus: str
    divergenceDetail: Optional[str] = None
    fileName: str
    fileUrl: Optional[str] = None

    class Config:
        from_attributes = True


def get_default_tenant(db: Session) -> Tenant:
    """Retorna ou cria o tenant padrão para desenvolvimento rápido."""
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


@router.post("/upload", response_model=ReceiptResponse)
async def upload_and_process_receipt(
    file: UploadFile = File(...),
    bank_account: Optional[str] = Form("Itaú Unibanco (Conta Principal)"),
    db: Session = Depends(get_db),
):
    """
    Endpoint principal de Upload & Scanner:
    1. Salva o arquivo em storage isolado por Tenant.
    2. Executa leitura OCR & IA Multimodal.
    3. Executa motor de conciliação bancária contra o extrato.
    4. Retorna dados estruturados para conferência imediata no frontend.
    """
    tenant = get_default_tenant(db)

    # 1. Armazenamento seguro
    file_path, file_url = await storage_service.save_receipt_file(tenant.id, file)

    # 2. Extração Multimodal via IA
    extracted = await ocr_extractor_service.extract_receipt_data(file_path, file.filename or "recibo.jpg")

    # 3. Cria registro do comprovante
    receipt = Receipt(
        tenant_id=tenant.id,
        original_file_name=file.filename or "comprovante.jpg",
        file_path=file_path,
        file_url=file_url,
        extracted_amount=extracted.amount,
        extracted_date=extracted.date,
        extracted_recipient=extracted.recipient,
        extracted_cnpj_cpf=extracted.cnpj_cpf,
        category=extracted.category_suggestion,
        bank_account=bank_account,
        payment_method=extracted.payment_method,
        ai_confidence_score=extracted.confidence_score,
        status=ReceiptStatus.PENDING_AI.value,
    )
    db.add(receipt)
    db.commit()
    db.refresh(receipt)

    # 4. Conciliação Automática contra o extrato
    status_res, matched_tx, divergence_reason = conciliation_matcher_service.match_receipt_with_bank_extract(
        db, receipt
    )

    return ReceiptResponse(
        id=receipt.id,
        amount=receipt.extracted_amount or 0.0,
        date=receipt.extracted_date or "",
        recipient=receipt.extracted_recipient or "",
        cnpjCpf=receipt.extracted_cnpj_cpf,
        category=receipt.category or "Outras Despesas",
        bankAccount=receipt.bank_account or "Conta Principal",
        confidence=receipt.ai_confidence_score or 0.0,
        matchStatus=receipt.status,
        divergenceDetail=divergence_reason,
        fileName=receipt.original_file_name,
        fileUrl=receipt.file_url,
    )


@router.get("/", response_model=List[ReceiptResponse])
def list_receipts(
    limit: int = 50,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Lista os comprovantes do tenant ordenados pelos mais recentes."""
    tenant = get_default_tenant(db)
    query = db.query(Receipt).filter(Receipt.tenant_id == tenant.id)

    if status_filter:
        query = query.filter(Receipt.status == status_filter)

    receipts = query.order_by(Receipt.uploaded_at.desc()).limit(limit).all()

    return [
        ReceiptResponse(
            id=r.id,
            amount=r.extracted_amount or 0.0,
            date=r.extracted_date or "",
            recipient=r.extracted_recipient or "",
            cnpjCpf=r.extracted_cnpj_cpf,
            category=r.category or "Outras Despesas",
            bankAccount=r.bank_account or "Conta Principal",
            confidence=r.ai_confidence_score or 0.0,
            matchStatus=r.status,
            divergenceDetail=r.divergence_reason,
            fileName=r.original_file_name,
            fileUrl=r.file_url,
        )
        for r in receipts
    ]
