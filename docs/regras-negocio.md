# 📋 Regras de Negócio - BPO Financeiro Automatizado

## 1. Princípio Fundamental: Zero Erros Contábeis
A automação com IA nunca deve fazer suposições que alterem valores de saldo sem segurança mínima de **90% de confiança**. Em caso de dúvida, a transação vai para a **Esteira de Exceções (Human-in-the-Loop)**.

---

## 2. Regras de Conciliação Bancária

### 2.1 Critérios de Match Automático (Aprovação Direta)
Uma transação é considerada **Conciliada Automaticamente** quando:
1. **Valor Exato:** O valor do comprovante bate 100% com o lançamento do extrato bancário.
2. **Janela de Data:** A data de pagamento/compensação está dentro de uma janela de **D-1 a D+2** dias úteis (para compensação de boletos/TED/Pix).
3. **Identificador ou Beneficiário:** O CNPJ/CPF ou nome do favorecido/pagador coincide ou tem similaridade alta (> 85%).
4. **Score de Confiança da IA:** Extração dos dados do documento teve pontuação **≥ 0.90**.

### 2.2 Critérios de Encaminhamento para Exceção (Atenção Humana)
A transação vai para a tela de revisão humana quando:
1. **Divergência de Valor:** Diferença entre o comprovante e o lançamento bancário (ex.: tarifas bancárias deduzidas, descontos não identificados).
2. **Duplicidade Potencial:** Dois lançamentos no mesmo dia com o mesmo valor para favorecidos diferentes ou repetidos.
3. **Comprovante Ilegível:** Foto cortada, embaçada ou com dados faltantes (Score da IA < 0.70).
4. **Sem Lançamento Correspondente no Extrato:** O comprovante existe no sistema, mas não apareceu no extrato em até 3 dias.

---

## 3. Classificação e Plano de Contas Simplificado
Para microempresas, a IA deve categorizar despesas e receitas automaticamente em um plano de contas enxuto:
* **Entradas (Receitas):** Venda de Serviços, Venda de Produtos, Aporte / Empréstimo, Outras Entradas.
* **Saídas Operacionais:** Fornecedores / Mercadorias, Pessoal / Pró-labore, Ferramentas & Software, Aluguel & Contas Básicas.
* **Saídas Tributárias e Financeiras:** Simples Nacional / DAS, Taxas de Cartão / Bancárias, Juros / Multas.

---

## 4. Integração Kiwify (Assinaturas e Acesso)
* **Status Ativo (`paid` / `order_approved`):** Usuário tem acesso liberado à plataforma e à cota de processamento de comprovantes contratada.
* **Status Inadimplente / Reembolsado (`refunded` / `chargedback` / `subscription_canceled`):** Bloqueio imediato da área logada com mensagem amigável direcionando para reativação.
* **Isolamento de Dados (Multi-tenancy):** Cada assinante acessa exclusivamente os seus próprios comprovantes e extratos (Row Level Security ou separação por Tenant ID).
