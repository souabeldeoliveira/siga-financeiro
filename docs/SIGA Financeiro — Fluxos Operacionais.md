# SIGA Financeiro — Fluxos Operacionais

## 1. Objetivo deste documento

Este documento descreve os fluxos práticos de uso do SIGA Financeiro.

Ele deve orientar a construção das telas, botões, ações e consequências operacionais do sistema.

Enquanto os documentos anteriores definem visão, regras e dados, este documento responde:

- o que Mariana faz;
- em qual tela faz;
- qual ação executa;
- o que o sistema deve atualizar;
- qual resultado esperado deve aparecer.

A prioridade é clareza operacional.

---

## 2. Princípio dos fluxos

O SIGA Financeiro deve ser orientado pela rotina real.

A página principal de trabalho é:

**Essa Semana**

As demais páginas existem para:

- cadastro;
- consulta;
- correção;
- histórico;
- relatório;
- configuração.

Regra:

> Toda ação operacional recorrente deve aparecer em “Essa Semana”.  
> Toda informação estrutural deve nascer em “Contratos”.  
> Toda inadimplência deve ser tratada em “Cobranças”.  
> Todo abatimento financeiro deve nascer em “Descontos no Repasse”.

---

# 3. Fluxo 1 — Cadastrar proprietário

## Objetivo

Registrar um proprietário para vincular imóveis e contratos.

## Tela

**Proprietários** ou cadastro interno usado pela tela de contratos.

## Ações da Mariana

1. Clicar em “Novo proprietário”.
2. Informar nome.
3. Informar telefone, se houver.
4. Informar e-mail, se houver.
5. Informar documento, se necessário.
6. Salvar.

## Resultado esperado

O proprietário fica disponível para seleção em:

- Imóveis;
- Contratos;
- Relatórios;
- Repasses.

## Dados criados

- `Owner`

## Validações

- Nome é obrigatório.
- Telefone, e-mail e documento podem ser opcionais no MVP.

---

# 4. Fluxo 2 — Cadastrar inquilino

## Objetivo

Registrar o inquilino para vincular ao contrato.

## Tela

**Inquilinos** ou cadastro interno usado pela tela de contratos.

## Ações da Mariana

1. Clicar em “Novo inquilino”.
2. Informar nome.
3. Informar telefone.
4. Informar e-mail, se houver.
5. Informar documento, se necessário.
6. Salvar.

## Resultado esperado

O inquilino fica disponível para seleção em Contratos.

## Dados criados

- `Tenant`

## Validações

- Nome é obrigatório.
- Telefone é recomendado, mas pode ser opcional no MVP.

---

# 5. Fluxo 3 — Cadastrar imóvel

## Objetivo

Registrar um imóvel administrado.

## Tela

**Imóveis** ou cadastro interno usado pela tela de contratos.

## Ações da Mariana

1. Clicar em “Novo imóvel”.
2. Selecionar proprietário.
3. Informar título curto do imóvel.
4. Informar endereço.
5. Informar cidade e estado.
6. Selecionar status.
7. Salvar.

## Resultado esperado

O imóvel fica disponível para seleção em Contratos.

## Dados criados

- `Property`

## Validações

- Proprietário é obrigatório.
- Título ou endereço é obrigatório.
- Imóvel novo pode iniciar como `VACANT`.

---

# 6. Fluxo 4 — Cadastrar contrato

## Objetivo

Criar contrato como fonte da verdade financeira.

## Tela

**Contratos**

## Ações da Mariana

1. Clicar em “Novo contrato”.
2. Selecionar proprietário.
3. Selecionar inquilino.
4. Selecionar imóvel.
5. Informar valor do aluguel.
6. Informar data de início.
7. Informar data de término.
8. Informar dia de vencimento.
9. Selecionar tipo de pagamento:
   - adiantado;
   - vencido.
10. Selecionar garantia:
   - caução;
   - Booz;
   - Loft.
11. Selecionar responsável pelo IPTU:
   - proprietário;
   - inquilino.
12. Selecionar titularidade da CEMIG:
   - inquilino;
   - proprietário;
   - terceiro.
13. Selecionar taxa de administração:
   - locação comum 10%;
   - temporada 20%.
14. Selecionar taxa de intermediação:
   - isento;
   - 50% após três meses.
15. Definir status principal:
   - ativo;
   - vago;
   - encerrado.
16. Salvar.

## Resultado esperado

Contrato fica cadastrado e disponível para geração de competências mensais.

## Dados criados

- `Contract`

## Validações

- Proprietário é obrigatório.
- Inquilino é obrigatório.
- Imóvel é obrigatório.
- Valor do aluguel é obrigatório.
- Data de início é obrigatória.
- Data de término é obrigatória.
- Dia de vencimento é obrigatório.
- Dia de vencimento deve ser entre 1 e 31.
- Status padrão recomendado: ativo.
- Situação auxiliar padrão: normal.

## Observação

Cadastrar contrato não deve gerar automaticamente cobrança, repasse ou desconto.

A geração operacional deve ocorrer pela competência mensal.

---

# 7. Fluxo 5 — Gerar competência mensal

## Objetivo

Criar a obrigação mensal de um contrato ativo.

## Tela

Pode ser:

- rotina administrativa;
- botão interno;
- rotina futura automática;
- tela de manutenção do sistema.

No MVP, pode existir botão manual:

**Gerar competências do mês**

## Ações da Mariana

1. Acessar rotina de geração mensal.
2. Selecionar mês/competência, se necessário.
3. Clicar em “Gerar competências”.
4. Conferir resultado.

## Resultado esperado

Para cada contrato ativo dentro do ciclo financeiro válido, o sistema cria uma `MonthlyObligation`.

## Dados criados

- `MonthlyObligation`

## Regras

- Não gerar competência duplicada para o mesmo contrato e mês.
- Não gerar competência para contrato encerrado.
- Não gerar competência após último pagamento devido.
- Gerar vencimento conforme dia de vencimento do contrato.
- Energia só deve ser pendente se CEMIG estiver em nome do proprietário.
- Água pode ser pendente conforme regra operacional inicial.
- IPTU só entra se houver IPTU aplicável à competência.

## Resultado visual

As competências com pendência aparecem em **Essa Semana**.

---

# 8. Fluxo 6 — Abrir “Essa Semana”

## Objetivo

Mariana visualiza tudo que precisa fazer.

## Tela

**Essa Semana**

## Ações da Mariana

1. Abrir o sistema.
2. Ir para “Essa Semana”.
3. Ver cards com pendências reais.

## Resultado esperado

A página mostra apenas contratos/competências com pendências.

## Não deve aparecer

- contrato em dia;
- contrato sem pendência;
- contrato futuro sem obrigação;
- contrato encerrado sem pendência antiga.

## Deve aparecer

- aluguel pendente;
- água pendente;
- energia pendente;
- IPTU aplicável;
- repasse pendente;
- comprovante do aluguel não enviado;
- comprovante do desconto não enviado;
- contrato vencendo, quando aplicável.

---

# 9. Fluxo 7 — Registrar comprovante de aluguel recebido

## Objetivo

Mariana registra que recebeu do inquilino o comprovante de pagamento do aluguel.

## Tela

**Essa Semana**

## Ações da Mariana

1. Localizar card do contrato.
2. Marcar:
   - “Comprovante de aluguel recebido”.
3. Opcionalmente anexar comprovante, se houver upload.
4. Salvar ou confirmar.

## Resultado esperado

O sistema atualiza a competência.

## Dados atualizados

- `MonthlyObligation.rentStatus = COMPLETED`
- `MonthlyObligation.rentProofReceivedAt = data atual`
- `PaymentProof`, se houver arquivo ou registro específico
- `Charge`, se existir cobrança aberta, deve ser resolvida

## Consequências

- Cobrança da competência deve sumir ou ficar resolvida.
- Repasse comum passa a poder aparecer.
- Card permanece se ainda houver outras pendências.
- Card desaparece se todas as pendências forem concluídas.

## Observação importante

“Comprovante de aluguel recebido” não é igual a “Comprovante do aluguel enviado ao proprietário”.

---

# 10. Fluxo 8 — Registrar comprovante de água recebido

## Objetivo

Registrar que o comprovante de água da competência foi recebido.

## Tela

**Essa Semana**

## Ações da Mariana

1. Localizar card do contrato.
2. Marcar:
   - “Comprovante de água recebido”.
3. Salvar ou confirmar.

## Resultado esperado

Água da competência fica concluída.

## Dados atualizados

- `MonthlyObligation.waterStatus = COMPLETED`
- `MonthlyObligation.waterProofReceivedAt = data atual`
- `WaterRecord.status = COMPLETED`, se existir
- `WaterRecord.proofReceivedAt = data atual`, se existir

## Consequências

- Pendência de água some do card.
- Card some se não houver outras pendências.

---

# 11. Fluxo 9 — Registrar comprovante de energia recebido

## Objetivo

Registrar comprovante de energia quando CEMIG estiver em nome do proprietário.

## Tela

**Essa Semana**

## Condição

Só aparece se:

- `Contract.cemigHolder = OWNER`

## Ações da Mariana

1. Localizar card do contrato.
2. Marcar:
   - “Comprovante de energia recebido”.
3. Salvar ou confirmar.

## Resultado esperado

Energia da competência fica concluída.

## Dados atualizados

- `MonthlyObligation.energyStatus = COMPLETED`
- `MonthlyObligation.energyProofReceivedAt = data atual`
- `EnergyRecord.status = COMPLETED`, se existir
- `EnergyRecord.proofReceivedAt = data atual`, se existir

## Consequências

- Pendência de energia some do card.
- Card some se não houver outras pendências.

---

# 12. Fluxo 10 — Cobrança D+5

## Objetivo

Gerar cobrança quando o aluguel passou do vencimento e não houve comprovante.

## Tela

**Cobranças**

## Condição

A cobrança aparece quando:

- contrato está ativo;
- competência está dentro do ciclo financeiro válido;
- vencimento passou há 5 dias ou mais;
- comprovante de aluguel não foi recebido.

## Resultado esperado

A cobrança aparece com estágio:

- D+5;
- D+7;
- D+10;
- D+15;
- D+20;
- D+30;
- decisão manual.

## Dados criados ou atualizados

- `Charge`
- `MonthlyObligation.chargeStatus`

## Consequências

- Mariana visualiza cobrança pendente.
- Se comprovante for recebido, cobrança é resolvida.

## Observação

Booz ou Loft não impedem cobrança.

Seguro/fiança libera repasse, mas não substitui comprovante.

---

# 13. Fluxo 11 — Repasse em contrato comum

## Objetivo

Repassar ao proprietário após o aluguel ser recebido.

## Tela

**Essa Semana**

## Condição

Contrato comum sem seguro/fiança especial.

O repasse só aparece após:

- “Comprovante de aluguel recebido” estar marcado.

## Ações da Mariana

1. Conferir bloco de repasse.
2. Conferir cálculo:
   - aluguel;
   - administração;
   - intermediação, se aplicável;
   - descontos, se houver;
   - valor líquido.
3. Fazer o repasse fora do sistema.
4. Marcar:
   - “Repasse concluído”.

## Resultado esperado

Repasse é registrado como concluído.

## Dados atualizados

- `Transfer.status = COMPLETED`
- `Transfer.transferredAt = data atual`
- `Transfer.netTransferAmount`
- `MonthlyObligation.transferStatus = COMPLETED`

## Consequências

- Repasse some como pendência.
- Card permanece se faltar comprovante do aluguel enviado ou comprovante de desconto enviado.
- Card desaparece se tudo estiver concluído.

---

# 14. Fluxo 12 — Repasse em contrato com Booz ou Loft

## Objetivo

Permitir repasse mesmo sem comprovante recebido quando houver seguro/fiança.

## Tela

**Essa Semana**

## Condição

Contrato com:

- garantia Booz; ou
- garantia Loft.

## Regra

O repasse pode aparecer mesmo sem comprovante de aluguel recebido.

O card deve mostrar:

- “Repasse liberado — fiança Booz”; ou
- “Repasse liberado — fiança Loft”.

## Ações da Mariana

1. Conferir bloco de repasse.
2. Conferir sinalização de fiança.
3. Fazer repasse fora do sistema.
4. Marcar:
   - “Repasse concluído”.

## Resultado esperado

Repasse é registrado.

## Dados atualizados

- `Transfer.status = COMPLETED`
- `Transfer.isReleasedByGuarantee = true`
- `Transfer.guaranteeType = BOOZ` ou `LOFT`
- `Transfer.transferredAt = data atual`

## Observação crítica

Esse fluxo não deve marcar:

- comprovante de aluguel recebido;
- aluguel pago;
- cobrança resolvida.

Se após D+5 não houver comprovante, deve aparecer em Cobranças.

---

# 15. Fluxo 13 — Comprovante do aluguel enviado ao proprietário

## Objetivo

Confirmar que o comprovante recebido do inquilino foi enviado ao proprietário.

## Tela

**Essa Semana**

## Ações da Mariana

1. Localizar card com repasse.
2. Marcar:
   - “Comprovante do aluguel enviado”.
3. Salvar.

## Resultado esperado

O sistema registra envio ao proprietário.

## Dados atualizados

- `MonthlyObligation.rentProofSentToOwnerAt = data atual`
- `Transfer.rentProofSentToOwnerAt = data atual`, se houver Transfer

## Consequências

- Checkpoint some.
- Card permanece se houver outras pendências.
- Card desaparece se tudo estiver concluído.

---

# 16. Fluxo 14 — Registrar desconto no repasse

## Objetivo

Criar abatimento que será aplicado ao repasse do proprietário.

## Tela

**Descontos no Repasse**

## Ações da Mariana

1. Clicar em:
   - “+ Registrar desconto”.
2. Selecionar tipo:
   - reparo;
   - conta;
   - outro.
3. Preencher “Especificar”.
4. Informar valor.
5. Selecionar contrato ativo.
6. Escolher:
   - desconto único; ou
   - parcelado.
7. Se parcelado, informar quantidade de parcelas.
8. Preencher observações, se necessário.
9. Salvar.

## Resultado esperado

Desconto fica ativo e será aplicado ao repasse correspondente.

## Dados criados

- `Discount`
- `DiscountInstallment`

## Validações

- Tipo é obrigatório.
- Especificar é obrigatório para todos os tipos.
- Valor é obrigatório.
- Contrato ativo é obrigatório.
- Quantidade de parcelas é obrigatória se for parcelado.
- Valor deve ser maior que zero.

---

# 17. Fluxo 15 — Aplicar desconto no repasse

## Objetivo

Desconto registrado reduz automaticamente o valor a repassar.

## Tela

**Essa Semana**

## Condição

Existe desconto ativo vinculado ao contrato.

## Resultado esperado no card

O bloco de repasse deve exibir:

- aluguel;
- taxa de administração ou intermediação;
- desconto aplicado;
- parcela do desconto, se parcelado;
- valor líquido final.

## Exemplo

```text
Aluguel: R$ 1.200,00
Administração 10%: -R$ 120,00
Desconto: Reparo hidráulico 1/2: -R$ 150,00
Valor a repassar: R$ 930,00
```

## Regra

A parcela do desconto só avança quando o repasse for concluído.

---

# 18. Fluxo 16 — Comprovante do valor descontado enviado

## Objetivo

Confirmar que a justificativa/comprovante do desconto foi enviada ao proprietário.

## Tela

**Essa Semana**

## Condição

Só aparece quando houver desconto aplicado ao repasse.

## Ações da Mariana

1. Localizar card com desconto.
2. Marcar:
   - “Comprovante do valor descontado enviado”.

## Resultado esperado

O envio do comprovante do desconto é registrado.

## Dados atualizados

- `MonthlyObligation.discountProofSentToOwnerAt = data atual`
- `Transfer.discountProofSentToOwnerAt = data atual`, se houver Transfer

## Consequências

- Se era a última pendência, card desaparece.
- Se ainda houver outra pendência, card permanece.

---

# 19. Fluxo 17 — Gerar mensagem ao proprietário

## Objetivo

Criar mensagem pronta para copiar e enviar ao proprietário.

## Tela

**Essa Semana**

## Ações da Mariana

1. Localizar card de repasse.
2. Clicar em:
   - “Gerar mensagem ao proprietário”.
3. Conferir mensagem.
4. Copiar mensagem.

## Resultado esperado

Sistema gera mensagem clara com resumo do repasse.

## A mensagem deve incluir

- nome do proprietário;
- imóvel;
- inquilino;
- valor do aluguel;
- taxa aplicada;
- desconto aplicado, se houver;
- especificação do desconto;
- parcela do desconto, se houver;
- valor final repassado;
- data do repasse, se concluído;
- menção aos comprovantes.

## Observação

O sistema não deve enviar WhatsApp automaticamente no MVP.

Apenas gerar texto.

---

# 20. Fluxo 18 — Criar IPTU anual

## Objetivo

Registrar IPTU do ano.

## Tela

**IPTU**

## Ações da Mariana

1. Clicar em “Novo IPTU”.
2. Selecionar imóvel/contrato.
3. Informar ano.
4. Selecionar tipo:
   - cota única;
   - parcelado.
5. Informar responsável:
   - proprietário;
   - inquilino.
6. Informar valor total.
7. Se parcelado, informar quantidade de parcelas.
8. Salvar.

## Resultado esperado

O IPTU fica registrado para controle anual.

## Dados criados

- `IptuRecord`
- `IptuInstallment`, se parcelado

## Validações

- Ano é obrigatório.
- Imóvel é obrigatório.
- Responsável é obrigatório.
- Valor é obrigatório.
- Quantidade de parcelas é obrigatória se for parcelado.

---

# 21. Fluxo 19 — Pagar IPTU cota única

## Objetivo

Marcar IPTU cota única como pago.

## Tela

**Essa Semana** ou **IPTU**

## Ações da Mariana

1. Localizar IPTU pendente.
2. Marcar:
   - “IPTU pago”.

## Resultado esperado

IPTU fica quitado.

## Dados atualizados

- `IptuRecord.status = PAID`
- `MonthlyObligation.iptuStatus = COMPLETED`, se vinculado à competência

## Consequências

- IPTU não aparece mais como pendência.

---

# 22. Fluxo 20 — Pagar parcela de IPTU

## Objetivo

Marcar parcela aplicável do IPTU como paga.

## Tela

**Essa Semana** ou **IPTU**

## Ações da Mariana

1. Localizar pendência:
   - “IPTU parcela X/Y paga”.
2. Marcar como paga.

## Resultado esperado

A parcela atual é concluída.

## Dados atualizados

- `IptuInstallment.status = PAID`
- `IptuInstallment.paidAt = data atual`
- `MonthlyObligation.iptuStatus = COMPLETED`, se não houver outra pendência de IPTU na competência

## Regra

A próxima parcela não deve aparecer imediatamente na mesma competência.

Ela só aparece na competência correta.

---

# 23. Fluxo 21 — Alerta anual de IPTU em 10 de março

## Objetivo

Lembrar Mariana de abrir o processo dos IPTUs anuais.

## Tela

**Dashboard**

## Condição

Data atual é 10 de março.

## Resultado esperado

Dashboard mostra:

“Mariana, hoje é 10 de março: abrir processo dos IPTUs anuais.”

## Observação

Esse alerta não depende de existir IPTU cadastrado.

É um lembrete operacional anual.

---

# 24. Fluxo 22 — Contrato vencendo em 30 dias

## Objetivo

Alertar que um contrato está próximo do término.

## Tela

**Contratos**, **Dashboard** ou **Essa Semana**

## Condição

Faltam 30 dias ou menos para a data de término.

## Resultado esperado

Sistema mostra alerta:

“Contrato vencendo em X dias.”

## Ações possíveis

- Renovado;
- Em desocupação.

---

# 25. Fluxo 23 — Renovar contrato

## Objetivo

Atualizar contrato renovado com novo prazo.

## Tela

**Contratos** ou alerta de vencimento.

## Ações da Mariana

1. Clicar em “Renovado”.
2. Informar nova data de término.
3. Confirmar.

## Resultado esperado

Contrato é atualizado.

## Dados atualizados

- `Contract.endDate = nova data`
- `Contract.lifecycleStatus = RENEWED` ou `NORMAL`, conforme decisão de interface
- `AuditLog`

## Consequências

- Alerta de vencimento desaparece.
- Contrato continua ativo.

---

# 26. Fluxo 24 — Marcar contrato em desocupação

## Objetivo

Indicar que o contrato não será renovado e seguirá para desocupação.

## Tela

**Contratos** ou alerta de vencimento.

## Ações da Mariana

1. Clicar em “Em desocupação”.
2. Confirmar decisão.

## Resultado esperado

Contrato fica sinalizado.

## Dados atualizados

- `Contract.lifecycleStatus = MOVING_OUT`
- `AuditLog`

## Consequências

- Alerta de renovação desaparece.
- Contrato não é encerrado automaticamente.
- Obrigações financeiras continuam até o último pagamento devido.

---

# 27. Fluxo 25 — Encerrar contrato

## Objetivo

Encerrar contrato após fim financeiro e operacional.

## Tela

**Contratos**

## Condição recomendada

Contrato só deve ser encerrado quando:

- último pagamento devido foi tratado;
- repasses pendentes foram concluídos;
- não há cobrança pendente relevante;
- desocupação foi finalizada, se aplicável.

## Ações da Mariana

1. Abrir contrato.
2. Conferir pendências.
3. Clicar em “Encerrar contrato”.
4. Confirmar.

## Resultado esperado

Contrato deixa de gerar novas obrigações.

## Dados atualizados

- `Contract.status = CLOSED`
- `AuditLog`

## Consequências

- Não gera novas competências.
- Pendências antigas, se existirem, ainda podem aparecer até serem resolvidas, conforme regra financeira.

---

# 28. Fluxo 26 — Gerar relatório anual

## Objetivo

Criar relatório anual para proprietário.

## Tela

**Relatórios**

## Ações da Mariana

1. Selecionar proprietário.
2. Selecionar ano.
3. Gerar relatório.
4. Conferir dados.
5. Marcar como gerado.

## Resultado esperado

Relatório fica com status “Gerado”.

## Dados criados ou atualizados

- `AnnualReport.status = GENERATED`
- `AnnualReport.generatedAt = data atual`

---

# 29. Fluxo 27 — Marcar relatório anual como enviado

## Objetivo

Registrar envio do relatório ao proprietário.

## Tela

**Relatórios**

## Ações da Mariana

1. Localizar relatório.
2. Marcar:
   - “Enviado”.

## Resultado esperado

Relatório fica com status “Enviado”.

## Dados atualizados

- `AnnualReport.status = SENT`
- `AnnualReport.sentAt = data atual`

---

# 30. Fluxo 28 — Abrir Dashboard

## Objetivo

Mostrar visão resumida de alertas.

## Tela

**Dashboard**

## Ações da Mariana

1. Abrir Dashboard.
2. Visualizar alertas.
3. Clicar em “Ir para Essa Semana”, se houver ações.

## O Dashboard deve mostrar

- cobranças em atraso;
- repasses pendentes;
- contratos vencendo;
- alerta de IPTU em 10 de março;
- resumo de pendências críticas;
- botão para Essa Semana.

## Regra

Dashboard não executa tarefas.

Abrir Dashboard não deve alterar dados.

---

# 31. Fluxo 29 — Exportar backup

## Objetivo

Exportar dados principais para segurança.

## Tela

**Backup**

## Ações da Mariana

1. Abrir Backup.
2. Clicar em “Exportar dados”.
3. Baixar arquivo JSON.

## Resultado esperado

Sistema gera arquivo com dados principais.

## Dados incluídos

- contratos;
- proprietários;
- inquilinos;
- imóveis;
- competências;
- comprovantes;
- cobranças;
- repasses;
- descontos;
- IPTU;
- relatórios;
- logs.

## Regra

Exportar backup não altera dados financeiros.

---

# 32. Fluxo 30 — Consultar histórico de contrato

## Objetivo

Ver histórico financeiro e operacional de um contrato.

## Tela

**Contratos > Detalhes do contrato**

## Resultado esperado

Mostrar:

- competências;
- comprovantes;
- cobranças;
- repasses;
- descontos;
- IPTU;
- água;
- energia;
- eventos de auditoria.

## Observação

No MVP, pode começar simples e evoluir depois.

---

# 33. Fluxos fora do MVP inicial

Não fazem parte do MVP inicial:

- envio automático de WhatsApp;
- recebimento automático de comprovantes;
- OCR/IA;
- integração bancária;
- assinatura digital;
- envio automático de e-mail;
- aplicativo mobile nativo;
- múltiplas empresas;
- permissões avançadas.

Esses fluxos podem ser planejados futuramente.

---

# 34. Resumo dos fluxos essenciais para o MVP

Os fluxos indispensáveis são:

1. cadastrar proprietário;
2. cadastrar inquilino;
3. cadastrar imóvel;
4. cadastrar contrato;
5. gerar competência mensal;
6. abrir Essa Semana;
7. marcar comprovante de aluguel recebido;
8. gerar cobrança D+5;
9. calcular repasse;
10. marcar repasse concluído;
11. registrar desconto;
12. aplicar desconto no repasse;
13. gerar mensagem ao proprietário;
14. controlar IPTU;
15. controlar água;
16. controlar energia;
17. alertar contrato vencendo;
18. consultar Dashboard;
19. exportar backup;
20. consultar histórico.

---

# 35. Regra final dos fluxos

Todo fluxo deve preservar três princípios:

1. Não gerar obrigação sem contrato.
2. Não executar tarefa sem competência.
3. Não esconder cálculo financeiro.

Se uma ação altera dinheiro, status financeiro ou obrigação, ela deve gerar histórico.