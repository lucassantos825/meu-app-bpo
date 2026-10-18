from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from src.core.config import settings
from src.models.receipt import Receipt, ReceiptStatus
from src.models.bank_transaction import BankTransaction


class ConciliationMatcherService:
    def __init__(
        self,
        min_confidence: float = settings.MIN_AUTO_MATCH_CONFIDENCE,
        days_before: int = settings.DATE_WINDOW_DAYS_BEFORE,
        days_after: int = settings.DATE_WINDOW_DAYS_AFTER,
    ):
        self.min_confidence = min_confidence
        self.days_before = days_before
        self.days_after = days_after

    def match_receipt_with_bank_extract(
        self, db: Session, receipt: Receipt
    ) -> Tuple[ReceiptStatus, Optional[BankTransaction], Optional[str]]:
        """
        Executa as regras estritas de conciliação bancária:
        Retorna (novo_status, transacao_correspondente, motivo_divergencia).
        """
        # REGRA 1: Score de Confiança da IA
        if not receipt.ai_confidence_score or receipt.ai_confidence_score < self.min_confidence:
            return (
                ReceiptStatus.RED_ALERT,
                None,
                f"Confiança da IA insuficiente ({(receipt.ai_confidence_score or 0) * 100:.0f}%). "
                "Documento com dados cortados ou ilegíveis.",
            )

        if not receipt.extracted_amount or receipt.extracted_amount <= 0:
            return (
                ReceiptStatus.RED_ALERT,
                None,
                "Valor do comprovante não pôde ser lido com precisão.",
            )

        # Buscar transações não conciliadas do mesmo tenant
        query = db.query(BankTransaction).filter(
            BankTransaction.tenant_id == receipt.tenant_id,
            BankTransaction.is_reconciled == False,
        )

        all_transactions = query.all()

        # Janela de data D-1 a D+2
        try:
            receipt_date = datetime.strptime(receipt.extracted_date, "%Y-%m-%d")
        except Exception:
            receipt_date = datetime.utcnow()

        start_window = receipt_date - timedelta(days=self.days_before)
        end_window = receipt_date + timedelta(days=self.days_after)

        matched_tx: Optional[BankTransaction] = None
        divergent_tx: Optional[BankTransaction] = None

        for tx in all_transactions:
            # Converte valor para positivo para comparação de montante absoluto
            tx_amount = abs(tx.amount)

            # Verifica janela de data
            try:
                tx_date = datetime.strptime(tx.date, "%Y-%m-%d")
            except Exception:
                tx_date = receipt_date

            in_date_window = start_window <= tx_date <= end_window

            # REGRA 2: Match exato de centavos
            if in_date_window and abs(tx_amount - receipt.extracted_amount) < 0.01:
                matched_tx = tx
                break
            
            # Possível divergência de valor (ex.: diferença pequena de centavos ou tarifas)
            elif in_date_window and abs(tx_amount - receipt.extracted_amount) <= 15.00:
                divergent_tx = tx

        # Se encontrou match perfeito
        if matched_tx:
            matched_tx.is_reconciled = True
            matched_tx.matched_receipt_id = receipt.id
            receipt.matched_transaction_id = matched_tx.id
            receipt.status = ReceiptStatus.AUTO_RECONCILED.value
            db.commit()
            return ReceiptStatus.AUTO_RECONCILED, matched_tx, None

        # Se encontrou lançamento com divergência de valor
        if divergent_tx:
            diff = abs(abs(divergent_tx.amount) - receipt.extracted_amount)
            reason = (
                f"Auto-Resolução Ativa: Comprovante de R$ {receipt.extracted_amount:.2f} cruza com lançamento "
                f"de R$ {abs(divergent_tx.amount):.2f} (Variação de R$ {diff:.2f}). Ajuste formulado pela IA aguardando "
                "confirmação em 1 clique na tela do cliente (sem intermediários humanos)."
            )
            receipt.status = ReceiptStatus.CLIENT_CONFIRMATION_REQUIRED.value
            receipt.divergence_reason = reason
            db.commit()
            return ReceiptStatus.CLIENT_CONFIRMATION_REQUIRED, divergent_tx, reason

        # Sem correspondência no extrato bancário
        reason = (
            f"Aguardando compensação: Nenhuma movimentação de R$ {receipt.extracted_amount:.2f} "
            f"identificada no extrato ({start_window.strftime('%d/%m')} a {end_window.strftime('%d/%m')}). "
            "Robô monitorando 24/7. Notificação gerada no painel para confirmação direta do cliente."
        )
        receipt.status = ReceiptStatus.CLIENT_CONFIRMATION_REQUIRED.value
        receipt.divergence_reason = reason
        db.commit()
        return ReceiptStatus.CLIENT_CONFIRMATION_REQUIRED, None, reason


conciliation_matcher_service = ConciliationMatcherService()
