import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Enum
import enum
from src.core.database import Base


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PAST_DUE = "PAST_DUE"
    CANCELED = "CANCELED"
    REFUNDED = "REFUNDED"
    BLOCKED = "BLOCKED"


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    cnpj_cpf = Column(String(32), nullable=True)
    
    # Integração Kiwify
    kiwify_order_id = Column(String(128), unique=True, index=True, nullable=True)
    kiwify_customer_email = Column(String(255), index=True, nullable=True)
    subscription_plan = Column(String(64), default="PLANO_PRO_MENSAL")
    subscription_status = Column(
        String(32), default=SubscriptionStatus.ACTIVE.value, nullable=False
    )
    
    is_active = Column(Boolean, default=True)
    monthly_receipts_limit = Column(String(32), default="UNLIMITED")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
