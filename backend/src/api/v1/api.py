from fastapi import APIRouter
from src.api.v1.endpoints import receipts, conciliation, bank_transactions

api_router = APIRouter()

api_router.include_router(receipts.router, prefix="/receipts", tags=["Comprovantes & Scanner"])
api_router.include_router(conciliation.router, prefix="/conciliation", tags=["Conciliação Bancária & Alertas"])
api_router.include_router(bank_transactions.router, prefix="/bank-transactions", tags=["Extrato Bancário"])
