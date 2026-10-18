from fastapi import APIRouter, Request, Header, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from src.core.database import get_db
from src.services.kiwify.webhook_service import kiwify_webhook_service

router = APIRouter()


@router.post("/kiwify", status_code=status.HTTP_200_OK)
async def handle_kiwify_webhook(
    request: Request,
    db: Session = Depends(get_db),
    x_kiwify_signature: Optional[str] = Header(None),
    signature: Optional[str] = Query(None),
):
    """
    Webhook oficial para integração Kiwify.
    Eventos suportados:
      - order_approved / subscription_created -> Ativa Tenant e cria Administrador
      - subscription_renewed -> Renova ciclo de faturamento
      - order_refunded / chargeback / subscription_canceled -> Bloqueia acesso
    """
    # 1. Validação do Token de Segurança
    token = x_kiwify_signature or signature or ""
    if not kiwify_webhook_service.verify_signature(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Assinatura/Token de Webhook Kiwify inválido.",
        )

    # 2. Parsing do Payload
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Corpo da requisição JSON inválido.",
        )

    # 3. Processamento Idempotente
    success, message, extra = kiwify_webhook_service.process_webhook_event(db, payload)

    return {
        "received": True,
        "processed": success,
        "message": message,
        "details": extra,
    }
