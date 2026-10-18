import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from src.core.config import settings
from src.core.database import Base, engine, SessionLocal
from src.models import Tenant, BankTransaction
from src.api.v1.api import api_router
from src.api.webhooks import kiwify

# Inicializa tabelas no banco de dados (SQLite / Postgres)
Base.metadata.create_all(bind=engine)

# Garante pasta de upload
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Motor de Conciliação Bancária com IA Multimodal e BPO Financeiro para Microempresas",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuração de CORS para integração com o Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir arquivos estáticos de comprovantes enviados
app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Rotas da API
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(kiwify.router, prefix="/api/webhooks", tags=["Webhooks Kiwify"])


@app.on_event("startup")
def seed_initial_demo_data():
    """Popula dados iniciais de demonstração para conciliação imediata."""
    db = SessionLocal()
    try:
        tenant = db.query(Tenant).first()
        if not tenant:
            tenant = Tenant(
                name="Oficina Mecânica & Peças Silva Ltda",
                cnpj_cpf="12.345.678/0001-90",
                subscription_plan="Plano BPO Micro Pro",
                is_active=True,
            )
            db.add(tenant)
            db.commit()
            db.refresh(tenant)

        # Se não houver transações bancárias, popula lançamentos do extrato do dia
        existing_txs = db.query(BankTransaction).filter(BankTransaction.tenant_id == tenant.id).count()
        if existing_txs == 0:
            from datetime import datetime
            today = datetime.utcnow().strftime("%Y-%m-%d")
            demo_txs = [
                BankTransaction(
                    tenant_id=tenant.id,
                    bank_name="Itaú Unibanco (Conta Principal)",
                    date=today,
                    description="DEB AUTO POSTO IPIRANGA",
                    amount=-184.50,
                    transaction_type="OUTFLOW",
                    is_reconciled=False,
                ),
                BankTransaction(
                    tenant_id=tenant.id,
                    bank_name="Nubank PJ",
                    date=today,
                    description="PIX ENVIADO KALUNGA GRAFICA",
                    amount=-245.90,
                    transaction_type="OUTFLOW",
                    is_reconciled=False,
                ),
                BankTransaction(
                    tenant_id=tenant.id,
                    bank_name="Itaú Unibanco (Conta Principal)",
                    date=today,
                    description="PAGTO ELETRON COBRANCA SHELL",
                    amount=-165.00,  # Divergência de valor intencional para Alerta Vermelho
                    transaction_type="OUTFLOW",
                    is_reconciled=False,
                ),
                BankTransaction(
                    tenant_id=tenant.id,
                    bank_name="Itaú Unibanco (Conta Principal)",
                    date=today,
                    description="PIX RECEBIDO CLIENTE CARLA MENDES",
                    amount=1500.00,
                    transaction_type="INFLOW",
                    is_reconciled=True,
                ),
            ]
            db.add_all(demo_txs)
            db.commit()
    finally:
        db.close()


@app.get("/", tags=["Health"])
def root_status():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
