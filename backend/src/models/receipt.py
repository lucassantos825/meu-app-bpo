import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
import enum
from src.core.database import Base


class ReceiptStatus(str, enum.Enum):
    PENDING_AI = "PENDING_AI"
    AUTO_RECONCILED = "AUTO_RECONCILED"
    RED_ALERT = "RED_ALERT"
    MANUALLY_RECONCILED = "MANUALLY_RECONCILED"
    DISCARDED = "DISCARDED"


class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)

    # Arquivo original
    original_file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_url = Column(String(512), nullable=True)

    # Dados extraídos por IA
    extracted_amount = Column(Float, nullable=True)
    extracted_date = Column(String(32), nullable=True)
    extracted_recipient = Column(String(255), nullable=True)
    extracted_cnpj_cpf = Column(String(32), nullable=True)
    category = Column(String(128), nullable=True)
    bank_account = Column(String(128), nullable=True)
    payment_method = Column(String(64), nullable=True)  # PIX, BOLETO, CARTAO, TED

    # IA e Conciliação
    ai_confidence_score = Column(Float, default=0.0)
    status = Column(String(32), default=ReceiptStatus.PENDING_AI.value, nullable=False, index=True)
    divergence_reason = Column(Text, nullable=True)
    matched_transaction_id = Column(String(36), nullable=True, index=True)

    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)
