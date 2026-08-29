# SIGA Financeiro — Visão Geral do Sistema

## 1. Objetivo do sistema

O SIGA Financeiro é um sistema operacional para gestão financeira de contratos de administração imobiliária.

O objetivo principal é organizar a rotina financeira da Mariana, reduzindo esquecimentos, erros de cálculo, retrabalho e dependência de controles manuais dispersos.

O sistema deve permitir:

- cadastrar contratos de locação;
- controlar vencimentos;
- acompanhar comprovantes recebidos;
- controlar cobranças em atraso;
- calcular repasses ao proprietário;
- registrar descontos no repasse;
- controlar IPTU, água e energia quando aplicável;
- gerar mensagens operacionais;
- manter histórico financeiro por contrato;
- oferecer uma visão semanal clara das ações pendentes.

O sistema será construído inicialmente para uso interno, com foco em operação simples, segura e mobile-first.

---

## 2. Usuária principal

A usuária principal do sistema é Mariana.

O sistema deve ser pensado para o uso semanal e prático dela.

A rotina esperada é:

1. Mariana abre o sistema.
2. Acessa a página **Essa Semana**.
3. Vê apenas contratos com pendências reais.
4. Marca comprovantes recebidos.
5. Verifica cobranças.
6. Confere repasses.
7. Registra descontos quando houver.
8. Gera mensagens para proprietários.
9. Finaliza as tarefas da semana.

A interface deve ser clara, objetiva e adequada para celular.

---

## 3. Princípio central do sistema

O SIGA Financeiro deve seguir esta regra estrutural:

> Contratos alimentam o sistema.\
> Competências mensais organizam as obrigações.\
> A página “Essa Semana” executa a rotina.\
> Cobranças tratam inadimplência.\
> Descontos ajustam repasses.\
> Dashboard alerta, mas não executa.

Esse princípio deve orientar todas as decisões de arquitetura.

---

## 4. Páginas principais

### 4.1 Dashboard

O Dashboard deve funcionar como painel de alerta.

Ele não deve ser a principal página operacional.

Deve mostrar:

- cobranças em atraso;
- repasses pendentes;
- contratos vencendo;
- alerta anual de IPTU em 10 de março;
- backup/status do sistema, se aplicável;
- resumo de pendências críticas;
- botão principal para acessar **Essa Semana**.

Regra:

> Dashboard alerta.\
> Essa Semana executa.

---

### 4.2 Essa Semana

A página **Essa Semana** é o centro operacional do sistema.

Ela deve mostrar apenas contratos com ações reais pendentes.

Não deve mostrar contratos em dia.

Não deve mostrar contratos que ainda não venceram e não possuem pendência.

Cada card deve representar uma competência mensal de um contrato, contendo tarefas como:

- comprovante de aluguel recebido;
- comprovante de água recebido;
- comprovante de energia recebido;
- IPTU pago ou parcela de IPTU paga;
- repasse concluído;
- comprovante do aluguel enviado ao proprietário;
- comprovante do valor descontado enviado;
- alerta de contrato vencendo;
- decisão de renovação ou desocupação, quando aplicável.

A página deve ser mobile-first, com cards simples, botões grandes e linguagem clara.

---

### 4.3 Contratos

A página Contratos é a fonte da verdade do sistema.

Todos os cálculos financeiros devem depender dos dados estruturais cadastrados no contrato.

Campos essenciais do contrato:

- proprietário;
- telefone do proprietário;
- inquilino;
- telefone do inquilino;
- imóvel;
- endereço;
- valor do aluguel;
- data de início;
- data de término;
- dia de vencimento;
- tipo de pagamento do aluguel;
- garantia;
- responsável pelo IPTU;
- titularidade da energia/CEMIG;
- taxa de administração;
- taxa de intermediação;
- status principal;
- situação contratual auxiliar.

Tipo de pagamento:

- adiantado;
- vencido.

Garantia:

- caução;
- Booz.
- Loft.\


Responsável pelo IPTU:

- proprietário;
- inquilino.

Titularidade da energia/CEMIG:

- inquilino;
- proprietário;
- terceiro.

Taxa de administração:

- locação comum — 10%;
- temporada — 20%.

Taxa de intermediação:

- isento;
- 50% após três meses



Status principal:

- ativo;
- vago;
- encerrado.

Situação contratual auxiliar:

- normal;
- vencendo;
- renovado;
- em desocupação.

---

### 4.4 Cobranças

A página Cobranças deve tratar inadimplência.

Um contrato deve aparecer em Cobranças quando:

- o contrato está ativo;
- o aluguel venceu há 5 dias ou mais;
- não existe comprovante de aluguel recebido para a competência;
- o contrato ainda está dentro do ciclo financeiro válido.

A cobrança deve evoluir em estágios:

- D+5;
- D+7;
- D+10;
- D+15;
- D+20;
- D+30;
- decisão manual.

A garantia por seguro fiança não elimina cobrança.

Regra importante:

> Seguro fiança pode liberar repasse, mas não substitui comprovante de pagamento e não impede cobrança após D+5.

---

### 4.5 Descontos no Repasse

A página **Descontos no Repasse** deve registrar valores que serão abatidos do valor a repassar ao proprietário.

Botão principal:

-
  - Registrar desconto.

Tipos de desconto:

- reparo;
- conta;
- outro.

O campo **Especificar** deve ser obrigatório para todos os tipos.

Exemplos:

- Reparo — “reparo hidráulico no banheiro social”;
- Conta — “conta de energia paga pelo inquilino”;
- Outro — “acordo autorizado pelo proprietário”.

Campos mínimos:

- tipo;
- especificação obrigatória;
- valor;
- contrato ativo vinculado;
- desconto único ou parcelado;
- quantidade de parcelas, se parcelado;
- observações.

O desconto deve impactar automaticamente o cálculo do repasse da competência correspondente.

Se houver desconto aplicado ao repasse, o card do contrato em **Essa Semana** deve exibir:

- valor do desconto;
- descrição do desconto;
- parcela atual, se parcelado;
- checkpoint “Comprovante do valor descontado enviado”.

---

### 4.6 IPTU

O módulo IPTU deve controlar obrigações anuais de IPTU.

Tipos:

- cota única;
- parcelado.

Campos importantes:

- ano;
- contrato/imóvel;
- responsável;
- valor total;
- quantidade de parcelas;
- parcelas pagas;
- status.

Todo dia 10 de março, o Dashboard deve exibir:

> Mariana, hoje é 10 de março: abrir processo dos IPTUs anuais.

Esse alerta deve aparecer mesmo que ainda não haja IPTU cadastrado.

A página **Essa Semana** deve mostrar IPTU apenas quando houver pendência aplicável naquele momento.

No caso de IPTU parcelado, o sistema não deve antecipar todas as parcelas. Deve exibir apenas a parcela aplicável à competência.

---

### 4.7 Água

O controle de água deve ser mensal por competência.

A obrigação de água deve gerar checkpoint em **Essa Semana** quando houver necessidade de conferência ou comprovante.

Checkpoint:

- Comprovante de água recebido.

---

### 4.8 Energia/CEMIG

A energia deve depender da titularidade cadastrada no contrato.

Se a titularidade da energia/CEMIG for **proprietário**, a página **Essa Semana** deve exibir:

- Comprovante de energia recebido.

Se a titularidade for **inquilino** ou **terceiro**, não deve gerar pendência de energia.

---

### 4.9 Relatórios Anuais

O módulo Relatórios Anuais deve permitir gerar e controlar relatórios para proprietários.

Status possíveis:

- não gerado;
- gerado;
- enviado.

O relatório anual deve, futuramente, considerar:

- aluguéis;
- repasses;
- descontos;
- IPTU;
- água;
- energia;
- cobranças;
- histórico do contrato.

---

## 5. Competência mensal

A competência mensal é o coração do sistema.

O sistema não deve funcionar apenas com checkboxes soltos.

Cada obrigação deve estar vinculada a:

- contrato;
- competência;
- tipo de obrigação;
- status;
- data de vencimento;
- data de conclusão, se houver;
- usuário que concluiu, se aplicável;
- histórico.

Exemplo de competência:

- contrato: Maria Oliveira;
- competência: 2026-09;
- aluguel: pendente;
- água: pendente;
- energia: aplicável;
- IPTU: parcela 4/10;
- repasse: pendente;
- desconto: reparo 1/2;
- cobrança: não iniciada.

Formato recomendado de competência:

- `YYYY-MM`.

Exemplo:

- `2026-09`.

A competência mensal resolve problemas de virada de mês, histórico, repasse, desconto, cobrança e relatório.

---

## 6. Regras financeiras centrais

### 6.1 Primeiro mês do contrato

Se houver taxa de intermediação diferente de isento:

- cobrar taxa de intermediação no primeiro mês;
- não cobrar taxa de administração no primeiro mês.

Se a taxa de intermediação for isenta:

- cobrar taxa de administração normalmente desde o primeiro mês.

### 6.2 Meses seguintes

Nos meses seguintes:

- cobrar taxa de administração;
- não cobrar taxa de intermediação.

### 6.3 Cálculo do repasse

O valor do repasse deve considerar:

- valor do aluguel;
- taxa de intermediação, se aplicável no primeiro mês;
- taxa de administração, se aplicável;
- descontos ativos aplicáveis à competência.

Regra:

- primeiro mês com intermediação: aluguel menos intermediação;
- primeiro mês com intermediação isenta: aluguel menos administração;
- meses seguintes: aluguel menos administração;
- se houver desconto: subtrair desconto do valor líquido.

### 6.4 Repasse em contratos comuns

Em contratos comuns, o repasse deve aparecer depois que o comprovante de aluguel recebido for marcado.

### 6.5 Repasse em contratos com Loft Booz

Em contratos com seguro fiança, o repasse pode aparecer mesmo sem comprovante de aluguel recebido.

O card deve exibir:

> Repasse liberado — fiança Booz.

O seguro não deve marcar aluguel como pago automaticamente.

A garantia não deve impedir cobrança após D+5 se não houver comprovante.

### 6.6 Último pagamento devido

O contrato não deve gerar novas obrigações financeiras após o último pagamento devido.

O cálculo do último pagamento depende de:

- data de início;
- data de término;
- dia de vencimento;
- tipo de pagamento: adiantado ou vencido.

Mesmo após o fim do ciclo financeiro, pendências já existentes devem continuar aparecendo até serem concluídas.

Exemplo:

- se o último aluguel foi recebido, mas o repasse ainda não foi concluído, o repasse deve continuar pendente;
- o sistema não deve gerar novos aluguéis após o fim financeiro do contrato.

---

## 7. Contratos vencendo

O sistema deve alertar quando um contrato estiver a 30 dias ou menos do vencimento.

O alerta deve aparecer no contrato e, futuramente, no Dashboard ou em **Essa Semana**.

Ações possíveis:

- Renovado;
- Em desocupação.

Se marcar Renovado:

- exigir novo prazo de encerramento;
- atualizar a data de término;
- remover o alerta.

Se marcar Em desocupação:

- marcar situação auxiliar como “em desocupação”;
- remover alerta de renovação;
- manter obrigações financeiras até o último pagamento devido.

“Em desocupação” não deve encerrar automaticamente o contrato financeiramente.

---

## 8. Mensagens ao proprietário

O sistema deve permitir gerar mensagem ao proprietário a partir do card de repasse.

A mensagem deve incluir:

- proprietário;
- imóvel;
- inquilino;
- valor do aluguel;
- taxa aplicada;
- desconto aplicado, se houver;
- especificação do desconto;
- valor final repassado;
- data do repasse, se concluído;
- menção aos comprovantes enviados.

Exemplo de conteúdo:

Olá, [Proprietário]. Tudo bem?

Segue resumo do repasse referente ao imóvel [Imóvel], locado para [Inquilino]:

Aluguel recebido: R$ [valor].\
Taxa de administração/intermediação: -R$ [valor].\
Desconto aplicado: [descrição], parcela [X/Y], -R$ [valor].

Valor repassado: R$ [valor final].

O desconto se refere a: [especificação].

Segue o comprovante do aluguel e o comprovante do valor descontado para conferência.

---

## 9. Auditoria e histórico

O sistema deve manter histórico das principais ações.

Eventos importantes:

- contrato criado;
- contrato editado;
- comprovante recebido;
- cobrança gerada;
- cobrança atualizada;
- repasse concluído;
- desconto criado;
- desconto aplicado;
- comprovante do desconto enviado;
- IPTU pago;
- relatório anual gerado;
- relatório anual enviado;
- contrato renovado;
- contrato marcado em desocupação;
- contrato encerrado.

Cada evento deve registrar:

- data;
- usuário;
- tipo de evento;
- contrato relacionado;
- dados relevantes.

---

## 10. Backup e segurança

O novo SIGA terá banco de dados na nuvem.

Mesmo assim, deve existir uma forma de exportação dos dados principais para segurança.

O backup pode ser JSON ou CSV em fases futuras.

Dados importantes:

- contratos;
- proprietários;
- inquilinos;
- imóveis;
- competências;
- pagamentos;
- comprovantes;
- cobranças;
- repasses;
- descontos;
- IPTU;
- relatórios;
- logs.

---

## 11. Integrações futuras

O sistema deve ser construído de forma preparada para integrações, mas sem depender delas na primeira versão.

Integrações futuras possíveis:

- WhatsApp Business Platform;
- análise automática de comprovantes;
- OCR/IA;
- armazenamento de documentos;
- notificações por e-mail;
- integração bancária;
- assinatura digital;
- geração automática de relatórios PDF.

O MVP inicial não deve depender dessas integrações.

---

## 12. Princípios de interface

A interface deve seguir estes princípios:

- mobile-first;
- poucos botões por tela;
- cards claros;
- linguagem operacional;
- evitar telas redundantes;
- priorizar ações reais;
- não mostrar contratos em dia em páginas operacionais;
- separar alerta de execução;
- separar recebido de enviado;
- sempre mostrar o cálculo financeiro de forma discriminada.

Exemplo de card ideal em **Essa Semana**:

Maria Oliveira\
Apartamento Centro\
Vencimento: dia 10\
Competência: Junho/2026

Pendências:

- [ ] Comprovante de aluguel recebido
- [ ] Comprovante de água recebido
- [ ] IPTU parcela 3/10 paga
- [ ] Comprovante de energia recebido

Repasse:

- Aluguel: R$ 1.200,00
- Administração 10%: -R$ 120,00
- Desconto: Reparo hidráulico 1/2: -R$ 150,00
- Valor a repassar: R$ 930,00

Ações:

- [ ] Repasse concluído
- [ ] Comprovante do aluguel enviado
- [ ] Comprovante do valor descontado enviado

Botão:

- Gerar mensagem ao proprietário

---

## 13. Fases de implementação

### Fase 1 — Base técnica

Criar:

- projeto Next.js;
- banco PostgreSQL;
- Prisma;
- autenticação;
- layout mobile-first;
- menu principal;
- estrutura inicial de pastas.

### Fase 2 — Cadastros-base

Criar:

- proprietários;
- inquilinos;
- imóveis;
- contratos.

Contratos já devem nascer com todos os campos estruturais.

### Fase 3 — Competências mensais

Criar lógica de competência mensal por contrato.

Gerar obrigações mensais apenas enquanto houver ciclo financeiro válido.

### Fase 4 — Essa Semana

Criar a página operacional principal.

Mostrar apenas pendências reais.

### Fase 5 — Cobranças

Criar regra D+5 e evolução de cobrança.

### Fase 6 — Repasses

Integrar repasses dentro de **Essa Semana**.

Calcular valor líquido automaticamente.

### Fase 7 — Descontos no Repasse

Criar página de descontos.

Aplicar descontos automaticamente no repasse.

### Fase 8 — IPTU, água e energia

Criar controle de obrigações específicas.

### Fase 9 — Relatórios e histórico

Criar relatórios anuais e logs de auditoria.

### Fase 10 — Integrações futuras

Preparar WhatsApp, OCR, documentos e automações externas.

---

## 14. Regra final de arquitetura

O sistema deve evitar duplicidade de lógica.

A regra financeira deve estar centralizada em funções ou serviços reutilizáveis.

Exemplos:

- cálculo de competência;
- cálculo de repasse;
- cálculo de cobrança;
- cálculo de contrato vencendo;
- aplicação de desconto;
- verificação de ciclo financeiro válido.

A interface deve apenas exibir e acionar essas regras.

O código deve ser organizado para que as regras de negócio sejam testáveis e reutilizáveis.

---

## 15. Resumo executivo

O SIGA Financeiro deve ser um sistema operacional financeiro para administração imobiliária, orientado por contrato e competência mensal.

A página principal de trabalho será **Essa Semana**.

O sistema deve controlar:

- aluguel;
- comprovantes;
- cobranças;
- repasses;
- descontos;
- IPTU;
- água;
- energia;
- relatórios;
- contratos vencendo;
- histórico.

O foco inicial é operação manual bem estruturada.

Integrações como WhatsApp, OCR e automações externas ficam para fases futuras.
