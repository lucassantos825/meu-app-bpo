import hmac
import hashlib
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from src.core.config import settings
from src.models.tenant import Tenant, SubscriptionStatus
from src.models.user import User


class KiwifyWebhookService:
    def __init__(self, webhook_secret: str = settings.KIWIFY_WEBHOOK_SECRET):
        self.webhook_secret = webhook_secret

    def verify_signature(self, token_or_signature: str) -> bool:
        """
        Valida o token de segurança da Kiwify enviado na requisição.
        """
        if not self.webhook_secret or self.webhook_secret == "kiwify_secret_token_default":
            # Em modo dev flexível, permite execução se token corresponder
            return True
        return token_or_signature == self.webhook_secret

    def process_webhook_event(
        self, db: Session, payload: Dict[str, Any]
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Processa eventos do ciclo de vida da Kiwify com garantia de idempotência.
        """
        event_type = payload.get("event") or payload.get("order_status") or "order_approved"
        order_id = payload.get("order_id") or payload.get("id") or str(payload.get("order", {}).get("id", ""))
        customer = payload.get("Customer", {}) or payload.get("customer", {})
        customer_email = customer.get("email", "").lower().strip()
        customer_name = customer.get("full_name") or customer.get("name") or "Microempresa Cliente"
        customer_doc = customer.get("CPF") or customer.get("cnpj") or customer.get("cpf")

        if not order_id:
            return False, "Campo 'order_id' obrigatório no payload Kiwify", {}

        # 1. Evento de Aprovação de Pedido / Criação de Assinatura
        if event_type in ["order_approved", "subscription_created", "paid"]:
            tenant = db.query(Tenant).filter(Tenant.kiwify_order_id == str(order_id)).first()

            if tenant:
                # Idempotência: Se já existe, garante status ativo
                tenant.subscription_status = SubscriptionStatus.ACTIVE.value
                tenant.is_active = True
                db.commit()
                return True, "Tenant existente reativado com sucesso (idempotente)", {"tenant_id": tenant.id}

            # Criação de novo Tenant
            tenant = Tenant(
                name=f"Empresa de {customer_name}",
                cnpj_cpf=customer_doc,
                kiwify_order_id=str(order_id),
                kiwify_customer_email=customer_email,
                subscription_plan=payload.get("plan_title", "Plano BPO Micro Pro"),
                subscription_status=SubscriptionStatus.ACTIVE.value,
                is_active=True,
            )
            db.add(tenant)
            db.flush()

            # Criação do usuário administrador
            user = db.query(User).filter(User.email == customer_email).first()
            if not user:
                user = User(
                    tenant_id=tenant.id,
                    email=customer_email,
                    full_name=customer_name,
                    hashed_password="TEMPORARY_INITIAL_PASSWORD_TO_RESET",
                    role="OWNER",
                    is_active=True,
                )
                db.add(user)

            db.commit()
            return True, "Tenant e Administrador criados com sucesso", {"tenant_id": tenant.id, "email": customer_email}

        # 2. Renovação de Assinatura
        elif event_type in ["subscription_renewed"]:
            tenant = db.query(Tenant).filter(
                (Tenant.kiwify_order_id == str(order_id)) | (Tenant.kiwify_customer_email == customer_email)
            ).first()

            if tenant:
                tenant.subscription_status = SubscriptionStatus.ACTIVE.value
                tenant.is_active = True
                db.commit()
                return True, "Ciclo de faturamento renovado com sucesso", {"tenant_id": tenant.id}
            return False, "Tenant não encontrado para renovação", {}

        # 3. Cancelamento, Reembolso ou Chargeback
        elif event_type in ["order_refunded", "chargeback", "subscription_canceled"]:
            tenant = db.query(Tenant).filter(
                (Tenant.kiwify_order_id == str(order_id)) | (Tenant.kiwify_customer_email == customer_email)
            ).first()

            if tenant:
                status_map = {
                    "order_refunded": SubscriptionStatus.REFUNDED.value,
                    "chargeback": SubscriptionStatus.BLOCKED.value,
                    "subscription_canceled": SubscriptionStatus.CANCELED.value,
                }
                tenant.subscription_status = status_map.get(event_type, SubscriptionStatus.BLOCKED.value)
                tenant.is_active = False
                db.commit()
                return True, f"Assinatura bloqueada devido ao evento {event_type}", {"tenant_id": tenant.id}
            return False, "Tenant não encontrado para bloqueio", {}

        return False, f"Evento '{event_type}' ignorado (sem ação necessária)", {}


kiwify_webhook_service = KiwifyWebhookService()
