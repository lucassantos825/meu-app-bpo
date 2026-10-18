import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, ForeignKey
from src.core.database import Base


class BankTransaction(Base):
    __tablename__ = "bank_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)

    bank_name = Column(String(128), nullable=False)
    account_number = Column(String(64), nullable=True)
    date = Column(String(32), nullable=False, index=True)
    description = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)  # Positivo = Entrada, Negativo = Saída
    transaction_type = Column(String(16), nullable=False)  # INFLOW, OUTFLOW

    is_reconciled = Column(Boolean, default=False, index=True)
    matched_receipt_id = Column(String(36), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
