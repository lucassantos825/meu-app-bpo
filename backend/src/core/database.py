from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from src.core.config import settings

# Engine configurado com suporte a multithreading no SQLite
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency para obter sessão de banco nas rotas FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
