# SIGA Financeiro — Regras de Negócio

## 1. Objetivo deste documento

Este documento define as regras de negócio do SIGA Financeiro.

Ele deve ser usado como referência principal para desenvolvimento, testes e revisão do sistema.

Sempre que houver dúvida entre uma decisão visual e uma regra de negócio, prevalece a regra de negócio.

---

## 2. Regra estrutural do sistema

O SIGA Financeiro deve seguir a seguinte arquitetura operacional:

> Contratos alimentam o sistema.  
> Competências mensais organizam as obrigações.  
> A página “Essa Semana” executa a rotina.  
> Cobranças tratam inadimplência.  
> Descontos ajustam repasses.  
> Dashboard alerta, mas não executa.

---

## 3. Contratos

### RN-001 — Contrato como fonte da verdade

Todo cálculo financeiro deve depender dos dados cadastrados no contrato.

Nenhum módulo deve calcular aluguel, cobrança, repasse, IPTU, energia ou desconto sem vínculo com um contrato.

---

### RN-002 — Campos obrigatórios do contrato

Todo contrato deve possuir, no mínimo:

- proprietário;
- inquilino;
- imóvel;
- endereço;
- valor do aluguel;
- data de início;
- data de término;
- dia de vencimento;
- tipo de pagamento;
- garantia;
- responsável pelo IPTU;
- titularidade da energia/CEMIG;
- taxa de administração;
- taxa de intermediação;
- status principal.

---

### RN-003 — Tipo de pagamento

O tipo de pagamento do contrato deve ser:

- adiantado;
- vencido.

Esse campo influencia o cálculo do último pagamento devido e a geração de competências mensais.

---

### RN-004 — Garantia

A garantia do contrato deve aceitar:

- caução;
- Booz;
- Loft.

Booz e Loft devem ser tratadas como modalidades de seguro/fiança, quando aplicável.

---

### RN-005 — Status principal do contrato

O status principal do contrato deve ser:

- ativo;
- vago;
- encerrado.

Apenas contratos ativos devem gerar novas obrigações financeiras.

---

### RN-006 — Situação contratual auxiliar

Além do status principal, o contrato pode possuir uma situação auxiliar:

- normal;
- vencendo;
- renovado;
- em desocupação.

A situação auxiliar não substitui o status principal.

Um contrato em desocupação ainda pode gerar obrigações financeiras até o último pagamento devido.

---

## 4. Competência mensal

### RN-007 — Competência como unidade financeira

Toda obrigação recorrente deve estar vinculada a uma competência mensal.

Formato recomendado:

`YYYY-MM`

Exemplo:

`2026-09`

---

### RN-008 — Competência vinculada ao contrato

Toda competência mensal deve estar vinculada a um contrato.

Uma competência não deve existir sem contrato.

---

### RN-009 — Obrigações dentro da competência

Uma competência pode conter obrigações como:

- aluguel;
- água;
- energia;
- IPTU;
- repasse;
- desconto;
- cobrança.

---

### RN-010 — Não usar checkbox solto

O sistema não deve tratar tarefas como checkboxes soltos e sem contexto.

Toda tarefa deve estar vinculada a:

- contrato;
- competência;
- tipo de obrigação;
- status;
- data de criação;
- data de conclusão, se houver.

---

### RN-011 — Geração de competências

O sistema deve gerar competências apenas para contratos ativos e dentro do ciclo financeiro válido.

Não deve gerar novas competências após o último pagamento devido.

---

### RN-012 — Pendências existentes após fim do ciclo

Se o contrato já atingiu o fim financeiro, o sistema não deve gerar novas obrigações.

Porém, obrigações já existentes devem continuar aparecendo até serem concluídas.

Exemplo:

Se o último aluguel foi recebido, mas o repasse ainda não foi concluído, o repasse deve continuar pendente.

---

## 5. Página “Essa Semana”

### RN-013 — Função da página

A página “Essa Semana” é o centro operacional do sistema.

Ela deve mostrar somente ações reais pendentes.

---

### RN-014 — Contratos em dia não aparecem

Contratos sem pendências reais não devem aparecer em “Essa Semana”.

---

### RN-015 — Contratos futuros não aparecem

Contratos que ainda não venceram e não possuem nenhuma pendência real não devem aparecer em “Essa Semana”.

---

### RN-016 — Card por contrato/competência

Cada card em “Essa Semana” deve representar uma competência de um contrato.

O card deve mostrar:

- inquilino;
- imóvel;
- vencimento;
- competência;
- pendências;
- repasse, quando aplicável;
- ações disponíveis.

---

### RN-017 — Tarefas possíveis em “Essa Semana”

A página pode exibir:

- comprovante de aluguel recebido;
- comprovante de água recebido;
- comprovante de energia recebido;
- IPTU pago;
- IPTU parcela X/Y paga;
- repasse concluído;
- comprovante do aluguel enviado;
- comprovante do valor descontado enviado;
- alerta de contrato vencendo;
- ação de renovação ou desocupação.

---

### RN-018 — Card desaparece quando concluído

Quando todas as pendências aplicáveis de um card forem concluídas, o card deve desaparecer da página “Essa Semana”.

---

### RN-019 — Dashboard não executa tarefas

O Dashboard não deve substituir a página “Essa Semana”.

O Dashboard alerta.

A página “Essa Semana” executa.

---

## 6. Aluguel e comprovante

### RN-020 — Comprovante de aluguel recebido

“Comprovante de aluguel recebido” significa que Mariana recebeu do inquilino o comprovante de pagamento.

Esse status não significa que o comprovante foi enviado ao proprietário.

---

### RN-021 — Comprovante do aluguel enviado

“Comprovante do aluguel enviado” significa que Mariana enviou ao proprietário o comprovante recebido do inquilino.

Esse checkpoint deve aparecer no bloco de repasse.

---

### RN-022 — Separação entre recebido e enviado

O sistema deve tratar como ações diferentes:

- comprovante de aluguel recebido;
- comprovante do aluguel enviado.

Essas ações não devem ser marcadas automaticamente uma pela outra.

---

## 7. Cobranças

### RN-023 — Regra de entrada em Cobranças

Um contrato deve aparecer em Cobranças quando:

- contrato está ativo;
- aluguel venceu há 5 dias ou mais;
- não existe comprovante de aluguel recebido para a competência;
- contrato está dentro do ciclo financeiro válido.

---

### RN-024 — Estágios de cobrança

A cobrança deve evoluir por estágios:

- D+5;
- D+7;
- D+10;
- D+15;
- D+20;
- D+30;
- decisão manual.

---

### RN-025 — Seguro fiança não elimina cobrança

Garantias como Booz ou Loft não eliminam a cobrança.

Mesmo quando o repasse estiver liberado por seguro/fiança, se não houver comprovante após D+5, a cobrança deve aparecer.

---

### RN-026 — Comprovante recebido remove cobrança

Se o comprovante de aluguel recebido for marcado para a competência, a cobrança daquela competência deve ser removida ou marcada como resolvida.

---

## 8. Repasses

### RN-027 — Repasse dentro de “Essa Semana”

O repasse deve ser tratado dentro da página “Essa Semana”.

A página Repasses não deve ser o centro operacional da rotina da Mariana.

---

### RN-028 — Repasse em contrato comum

Em contrato comum, o repasse só deve aparecer quando houver comprovante de aluguel recebido para a competência.

---

### RN-029 — Repasse em contrato com seguro/fiança

Em contratos com Booz ou Loft, o repasse pode aparecer mesmo sem comprovante de aluguel recebido.

Nesse caso, o card deve exibir mensagem clara:

`Repasse liberado — fiança Booz`

ou

`Repasse liberado — fiança Loft`

conforme a garantia cadastrada.

---

### RN-030 — Seguro/fiança não marca aluguel como pago

A liberação do repasse por Booz ou Loft não deve marcar o aluguel como pago.

Também não deve marcar comprovante de aluguel recebido.

---

### RN-031 — Data automática do repasse

Ao marcar “Repasse concluído”, o sistema deve registrar automaticamente:

- data do repasse;
- valor repassado;
- contrato;
- competência;
- usuário responsável, se houver autenticação.

---

### RN-032 — Repasse concluído não encerra outros checkpoints

Marcar “Repasse concluído” não deve marcar automaticamente:

- comprovante do aluguel enviado;
- comprovante do valor descontado enviado.

---

## 9. Taxas

### RN-033 — Taxa de administração

A taxa de administração deve aceitar:

- locação comum — 10%;
- temporada — 20%.

---

### RN-034 — Taxa de intermediação

A taxa de intermediação deve aceitar:

- isento;
- 50% após três meses.

---

### RN-035 — Intermediação no primeiro ciclo aplicável

Quando houver taxa de intermediação diferente de isento, ela deve ser cobrada conforme a regra contratual cadastrada.

A taxa de intermediação não deve ser somada à taxa de administração na mesma competência de cobrança da intermediação.

---

### RN-036 — Administração quando intermediação for isenta

Se a taxa de intermediação for isenta, a taxa de administração deve ser aplicada normalmente desde a primeira competência aplicável.

---

### RN-037 — Administração nos meses comuns

Nas competências comuns, sem cobrança de intermediação, deve ser aplicada a taxa de administração conforme o contrato.

---

## 10. Cálculo do repasse

### RN-038 — Fórmula base

O valor do repasse deve considerar:

- aluguel;
- taxa de administração;
- taxa de intermediação, quando aplicável;
- descontos no repasse;
- ajustes manuais autorizados, se existirem no futuro.

---

### RN-039 — Exibir cálculo discriminado

O sistema deve sempre exibir o cálculo do repasse de forma discriminada.

Exemplo:

- Aluguel: R$ 1.200,00;
- Administração 10%: -R$ 120,00;
- Desconto: Reparo hidráulico 1/2: -R$ 150,00;
- Valor a repassar: R$ 930,00.

---

### RN-040 — Não ocultar desconto no valor final

Descontos não devem ser embutidos silenciosamente no valor final.

Todo desconto aplicado deve aparecer discriminado.

---

## 11. Descontos no Repasse

### RN-041 — Nome do módulo

O módulo deve se chamar:

`Descontos no Repasse`

---

### RN-042 — Finalidade do módulo

O módulo deve registrar valores que serão abatidos do valor a repassar ao proprietário.

---

### RN-043 — Tipos de desconto

O desconto deve aceitar os tipos:

- reparo;
- conta;
- outro.

---

### RN-044 — Especificação obrigatória

O campo “Especificar” deve ser obrigatório para todos os tipos de desconto.

Não deve ser permitido salvar desconto sem especificação.

---

### RN-045 — Desconto vinculado a contrato ativo

Todo desconto deve ser vinculado a um contrato ativo.

---

### RN-046 — Desconto único ou parcelado

O desconto pode ser:

- único;
- parcelado.

Se for parcelado, deve informar a quantidade de parcelas.

---

### RN-047 — Aplicação automática no repasse

Descontos ativos devem ser aplicados automaticamente no cálculo do repasse da competência correspondente.

---

### RN-048 — Avanço de parcela do desconto

Em desconto parcelado, a parcela só deve avançar quando o repasse da competência for marcado como concluído.

A parcela não deve avançar apenas porque mudou o mês.

---

### RN-049 — Checkpoint de comprovante do desconto

Se houver desconto aplicado ao repasse, o card deve exibir:

`Comprovante do valor descontado enviado`

---

### RN-050 — Card não desaparece sem comprovante do desconto

Se houver desconto aplicado e o comprovante do valor descontado ainda não foi enviado, o card deve permanecer em “Essa Semana”, mesmo que o repasse esteja concluído.

---

## 12. IPTU

### RN-051 — Responsável pelo IPTU

O contrato deve indicar o responsável pelo IPTU:

- proprietário;
- inquilino.

---

### RN-052 — Tipos de IPTU

O IPTU pode ser:

- cota única;
- parcelado.

---

### RN-053 — IPTU em “Essa Semana”

O IPTU só deve aparecer em “Essa Semana” quando houver pendência aplicável à competência.

---

### RN-054 — IPTU parcelado não antecipa parcela

No IPTU parcelado, o sistema não deve mostrar automaticamente todas as parcelas futuras.

Deve mostrar apenas a parcela aplicável à competência.

---

### RN-055 — Parcela paga some da competência

Quando a parcela de IPTU aplicável for marcada como paga, a pendência deve sumir da competência atual.

A próxima parcela só deve aparecer na competência correta.

---

### RN-056 — Alerta anual de IPTU

Todo dia 10 de março, o Dashboard deve mostrar:

`Mariana, hoje é 10 de março: abrir processo dos IPTUs anuais.`

Esse alerta deve aparecer mesmo que ainda não haja IPTU cadastrado.

---

## 13. Água

### RN-057 — Água por competência

A água deve ser controlada por competência mensal.

---

### RN-058 — Checkpoint de água

Quando aplicável, a competência deve exibir:

`Comprovante de água recebido`

---

### RN-059 — Água concluída

Ao marcar o comprovante de água como recebido, a pendência de água da competência deve ser concluída.

---

## 14. Energia/CEMIG

### RN-060 — Titularidade da energia

O contrato deve indicar a titularidade da energia/CEMIG:

- inquilino;
- proprietário;
- terceiro.

---

### RN-061 — Energia aparece somente se titularidade for proprietário

Se a titularidade da energia/CEMIG for proprietário, “Essa Semana” deve exibir:

`Comprovante de energia recebido`

---

### RN-062 — Energia não aparece para inquilino ou terceiro

Se a titularidade da energia/CEMIG for inquilino ou terceiro, o sistema não deve gerar pendência de energia.

---

## 15. Contratos vencendo

### RN-063 — Alerta 30 dias antes

Quando faltar 30 dias ou menos para a data de término do contrato, o sistema deve sinalizar que o contrato está vencendo.

---

### RN-064 — Ações possíveis no vencimento

O alerta de vencimento deve permitir:

- renovar;
- marcar em desocupação.

---

### RN-065 — Renovação exige nova data

Ao marcar contrato como renovado, o sistema deve exigir nova data de término.

Após salvar a nova data, o alerta deve desaparecer.

---

### RN-066 — Em desocupação não encerra financeiramente

Marcar contrato como “em desocupação” não deve encerrar automaticamente o contrato do ponto de vista financeiro.

O sistema deve manter as obrigações até o último pagamento devido.

---

## 16. Relatórios anuais

### RN-067 — Status do relatório anual

O relatório anual deve possuir status:

- não gerado;
- gerado;
- enviado.

---

### RN-068 — Relatório anual enviado

Marcar relatório como enviado deve registrar data de envio.

---

### RN-069 — Conteúdo futuro do relatório

O relatório anual deve poder considerar:

- aluguéis;
- repasses;
- descontos;
- IPTU;
- água;
- energia;
- cobranças;
- histórico do contrato.

---

## 17. Mensagem ao proprietário

### RN-070 — Botão de gerar mensagem

O card de repasse deve possuir botão:

`Gerar mensagem ao proprietário`

---

### RN-071 — Conteúdo mínimo da mensagem

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

---

### RN-072 — Mensagem deve incluir desconto

Se houver desconto aplicado ao repasse, a mensagem deve mencionar claramente:

- tipo do desconto;
- especificação;
- parcela atual, se parcelado;
- valor descontado.

---

## 18. Dashboard

### RN-073 — Dashboard como painel de alerta

O Dashboard deve alertar, não executar tarefas.

---

### RN-074 — Alertas possíveis

O Dashboard pode mostrar:

- cobranças em atraso;
- repasses pendentes;
- contratos vencendo;
- alerta de IPTU em 10 de março;
- backup/status do sistema;
- pendências críticas.

---

### RN-075 — Botão para Essa Semana

O Dashboard deve priorizar acesso à página “Essa Semana”.

---

## 19. Auditoria

### RN-076 — Eventos auditáveis

O sistema deve registrar histórico de eventos relevantes, como:

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

---

### RN-077 — Dados mínimos do log

Cada evento de auditoria deve registrar:

- data;
- usuário;
- tipo de evento;
- contrato relacionado, quando aplicável;
- dados relevantes.

---

## 20. Interface

### RN-078 — Mobile-first

A interface deve ser construída com prioridade para celular.

---

### RN-079 — Cards claros

As páginas operacionais devem usar cards simples, com informações essenciais e ações visíveis.

---

### RN-080 — Não duplicar telas operacionais

O sistema deve evitar páginas diferentes executando a mesma rotina.

A rotina operacional principal deve estar em “Essa Semana”.

---

### RN-081 — Linguagem operacional

Os textos da interface devem ser diretos e práticos.

Evitar termos genéricos quando houver termo financeiro mais claro.

---

## 21. Backup e exportação

### RN-082 — Exportação futura

O sistema deve permitir exportar dados principais em formato JSON ou CSV em fase futura.

---

### RN-083 — Dados importantes para backup

O backup deve considerar:

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

## 22. Integrações futuras

### RN-084 — WhatsApp fora do MVP inicial

A integração com WhatsApp não faz parte do MVP inicial.

O sistema deve ser construído de forma preparada para integração futura, mas sem depender dela.

---

### RN-085 — OCR/IA fora do MVP inicial

Análise automática de comprovantes por OCR/IA não faz parte do MVP inicial.

Pode ser prevista futuramente.

---

## 23. Regra final

### RN-086 — Centralização das regras

As regras financeiras devem ficar centralizadas em funções ou serviços reutilizáveis.

A interface não deve duplicar lógica de negócio.

Exemplos de regras centralizadas:

- cálculo de competência;
- cálculo de repasse;
- cálculo de cobrança;
- cálculo de último pagamento devido;
- aplicação de desconto;
- verificação de contrato vencendo;
- geração de alertas.

---

### RN-087 — Testabilidade

Toda regra financeira importante deve ser testável por unidade ou por caso de uso.

O sistema deve permitir criar testes para:

- competência mensal;
- cobrança D+5;
- repasse comum;
- repasse com Booz;
- repasse com Loft;
- desconto único;
- desconto parcelado;
- IPTU parcelado;
- contrato vencendo;
- último pagamento devido.

---

## 24. Resumo das regras críticas

As regras mais importantes do SIGA Financeiro são:

1. Contrato é a fonte da verdade.
2. Toda obrigação deve pertencer a uma competência mensal.
3. “Essa Semana” mostra apenas pendências reais.
4. Dashboard alerta, mas não executa.
5. Cobrança começa em D+5 sem comprovante.
6. Booz e Loft podem liberar repasse, mas não eliminam cobrança.
7. Seguro/fiança não marca aluguel como pago.
8. Repasse deve mostrar cálculo discriminado.
9. Desconto deve ser especificado obrigatoriamente.
10. Desconto parcelado só avança quando o repasse é concluído.
11. IPTU parcelado não antecipa parcelas futuras.
12. Energia só aparece se a titularidade for do proprietário.
13. Contrato vencendo deve alertar 30 dias antes.
14. Em desocupação não encerra automaticamente o contrato financeiro.
15. Regras financeiras devem ser centralizadas e testáveis.