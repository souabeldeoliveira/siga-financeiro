# SIGA Financeiro — Roadmap MVP Codex

## 1. Objetivo deste documento

Este documento define a ordem de implementação do MVP do SIGA Financeiro no Codex.

O objetivo é evitar que o sistema seja construído de forma confusa, apressada ou com regras financeiras espalhadas pela interface.

O Codex deve seguir este roadmap em fases pequenas, testáveis e progressivas.

Regra principal:

> Não construir tudo de uma vez.  
> Implementar por etapas.  
> Testar cada etapa antes de avançar.

---

## 2. Princípio de implementação

O MVP deve nascer com base sólida.

A ordem correta é:

1. estrutura técnica;
2. banco de dados;
3. cadastros-base;
4. contratos;
5. competências mensais;
6. página Essa Semana;
7. cobranças;
8. repasses;
9. descontos;
10. IPTU, água e energia;
11. dashboard;
12. relatórios;
13. auditoria;
14. integrações futuras.

O sistema não deve começar por WhatsApp, OCR, automações externas ou relatórios complexos.

---

## 3. Stack recomendada

A stack inicial recomendada é:

- Next.js;
- TypeScript;
- PostgreSQL;
- Prisma;
- Tailwind CSS;
- autenticação simples;
- deploy posterior em Vercel ou plataforma equivalente;
- banco em Supabase, Neon, Railway ou equivalente.

O MVP deve funcionar primeiro como sistema web manual, com banco na nuvem.

---

## 4. Estrutura inicial de pastas

Estrutura recomendada:

```text
siga-financeiro/
  app/
    dashboard/
    essa-semana/
    contratos/
    cobrancas/
    descontos-no-repasse/
    iptu/
    relatorios/
    backup/
    api/
  components/
    layout/
    forms/
    cards/
    tables/
    buttons/
  lib/
    prisma.ts
    dates.ts
    money.ts
    contracts.ts
    obligations.ts
    charges.ts
    transfers.ts
    discounts.ts
    iptu.ts
    audit.ts
  prisma/
    schema.prisma
    seed.ts
  docs/
    01-visao-geral-siga-financeiro.md
    02-regras-de-negocio.md
    03-modelo-de-dados.md
    04-schema-prisma-inicial.md
    05-roadmap-mvp-codex.md
```

A pasta `lib/` deve concentrar regras de negócio.

A interface não deve duplicar regras financeiras.

---

## 5. Fase 1 — Base técnica do projeto

### Objetivo

Criar a fundação técnica do SIGA Financeiro.

### Entregas

- criar projeto Next.js com TypeScript;
- instalar Tailwind CSS;
- instalar Prisma;
- configurar PostgreSQL;
- configurar `.env`;
- criar conexão `lib/prisma.ts`;
- criar layout base;
- criar menu principal;
- criar páginas vazias principais.

### Páginas iniciais

- Dashboard;
- Essa Semana;
- Contratos;
- Cobranças;
- Descontos no Repasse;
- IPTU;
- Relatórios;
- Backup.

### Critérios de aceite

- projeto roda localmente;
- banco conecta;
- Prisma funciona;
- menu navega entre as páginas;
- layout é mobile-first;
- não há erro no console.

### Não fazer nesta fase

- não criar regras financeiras;
- não criar automações;
- não criar WhatsApp;
- não criar OCR;
- não criar dashboard inteligente.

---

## 6. Fase 2 — Schema Prisma e migração inicial

### Objetivo

Criar o banco de dados inicial conforme o modelo definido.

### Entregas

- criar `schema.prisma`;
- adicionar enums;
- adicionar models principais;
- rodar primeira migration;
- gerar Prisma Client;
- criar seed básico, se necessário.

### Models prioritários

- User;
- Owner;
- Tenant;
- Property;
- Contract;
- MonthlyObligation;
- PaymentProof;
- Charge;
- Transfer;
- Discount;
- DiscountInstallment;
- IptuRecord;
- IptuInstallment;
- WaterRecord;
- EnergyRecord;
- AnnualReport;
- AuditLog.

### Critérios de aceite

- migration executa sem erro;
- Prisma Client gera sem erro;
- banco possui tabelas principais;
- constraints principais existem;
- `contractId + competence` é único em `MonthlyObligation`.

### Não fazer nesta fase

- não construir telas completas;
- não implementar cálculos ainda;
- não gerar competências automaticamente ainda.

---

## 7. Fase 3 — Cadastros-base

### Objetivo

Criar cadastros simples para proprietários, inquilinos e imóveis.

### Entregas

Criar CRUD básico para:

- Proprietários;
- Inquilinos;
- Imóveis.

### Proprietário

Campos mínimos:

- nome;
- telefone;
- e-mail;
- documento;
- observações.

### Inquilino

Campos mínimos:

- nome;
- telefone;
- e-mail;
- documento;
- observações.

### Imóvel

Campos mínimos:

- proprietário;
- título;
- endereço;
- cidade;
- estado;
- status;
- observações.

### Critérios de aceite

- criar proprietário;
- editar proprietário;
- listar proprietário;
- criar inquilino;
- editar inquilino;
- listar inquilino;
- criar imóvel vinculado a proprietário;
- editar imóvel;
- listar imóvel;
- excluir fisicamente apenas se não houver vínculos financeiros.

### Não fazer nesta fase

- não criar contrato ainda;
- não criar repasse;
- não criar cobrança.

---

## 8. Fase 4 — Contratos

### Objetivo

Criar a tela de contratos como fonte da verdade financeira.

### Entregas

CRUD completo de contratos.

### Campos obrigatórios

- proprietário;
- inquilino;
- imóvel;
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
- status principal;
- situação contratual auxiliar;
- observações.

### Valores de seleção

Tipo de pagamento:

- adiantado;
- vencido.

Garantia:

- caução;
- Booz;
- Loft.

Responsável pelo IPTU:

- proprietário;
- inquilino.

Titularidade CEMIG:

- inquilino;
- proprietário;
- terceiro.

Taxa de administração:

- locação comum 10%;
- temporada 20%.

Taxa de intermediação:

- isento;
- 50% após três meses.

Status principal:

- ativo;
- vago;
- encerrado.

Situação auxiliar:

- normal;
- vencendo;
- renovado;
- em desocupação.

### Critérios de aceite

- criar contrato ativo;
- editar contrato;
- listar contratos;
- visualizar detalhes;
- filtros por status;
- contrato mostra proprietário, inquilino e imóvel;
- valores monetários formatados corretamente;
- datas formatadas corretamente.

### Não fazer nesta fase

- não gerar cobranças;
- não gerar repasses;
- não gerar competências automaticamente ainda.

---

## 9. Fase 5 — Regras utilitárias centrais

### Objetivo

Criar funções de negócio reutilizáveis antes das telas operacionais.

### Arquivos sugeridos

- `lib/dates.ts`;
- `lib/money.ts`;
- `lib/contracts.ts`;
- `lib/obligations.ts`;
- `lib/transfers.ts`;
- `lib/charges.ts`.

### Funções mínimas

Em `money.ts`:

- formatar dinheiro;
- calcular percentual;
- subtrair taxas;
- evitar uso de float.

Em `dates.ts`:

- formatar datas;
- calcular competência `YYYY-MM`;
- calcular vencimento por dia;
- verificar D+5, D+7, D+10 etc.;
- verificar contrato vencendo em 30 dias.

Em `contracts.ts`:

- verificar se contrato está ativo;
- verificar se contrato está dentro do ciclo financeiro válido;
- calcular último pagamento devido;
- identificar primeiro ciclo aplicável;
- verificar se contrato usa seguro/fiança.

Em `transfers.ts`:

- calcular taxa de administração;
- calcular taxa de intermediação;
- calcular desconto aplicável;
- calcular valor líquido do repasse;
- identificar repasse liberado por Booz ou Loft.

Em `charges.ts`:

- calcular estágio de cobrança;
- verificar se deve gerar cobrança;
- resolver cobrança quando comprovante é recebido.

### Critérios de aceite

- funções isoladas criadas;
- regras não ficam duplicadas na interface;
- funções podem ser testadas;
- não há dependência desnecessária de componentes visuais.

### Não fazer nesta fase

- não construir página Essa Semana ainda;
- não criar automação mensal complexa ainda.

---

## 10. Fase 6 — Competências mensais

### Objetivo

Implementar a geração e o controle de competências mensais.

### Entregas

- função para criar competência mensal por contrato;
- função para buscar competência existente;
- função para evitar duplicidade;
- rotina manual para gerar competência do mês;
- proteção contra geração após fim financeiro do contrato.

### Regras

- uma competência por contrato por mês;
- competência no formato `YYYY-MM`;
- não gerar competência para contrato encerrado;
- não gerar competência após último pagamento devido;
- pendências antigas continuam até serem concluídas.

### Critérios de aceite

- gerar competência para contrato ativo;
- não gerar competência duplicada;
- não gerar competência para contrato encerrado;
- não gerar competência além do ciclo financeiro válido;
- competência registra vencimento correto.

### Não fazer nesta fase

- não criar cobrança automática ainda;
- não criar repasse automático ainda;
- não criar desconto ainda.

---

## 11. Fase 7 — Página Essa Semana

### Objetivo

Criar o centro operacional do sistema.

### Entregas

Página **Essa Semana** com cards de competências pendentes.

### Regras

Mostrar somente competências com pendências reais.

Não mostrar:

- contratos em dia;
- contratos sem pendência;
- contratos futuros sem obrigação aplicável.

Cada card deve mostrar:

- inquilino;
- imóvel;
- vencimento;
- competência;
- pendências;
- bloco de repasse, quando aplicável;
- botões de ação.

### Checkpoints possíveis

- comprovante de aluguel recebido;
- comprovante de água recebido;
- comprovante de energia recebido;
- IPTU pago;
- IPTU parcela X/Y paga;
- repasse concluído;
- comprovante do aluguel enviado;
- comprovante do valor descontado enviado.

### Critérios de aceite

- contrato com pendência aparece;
- contrato sem pendência não aparece;
- marcar comprovante de aluguel recebido atualiza competência;
- marcar comprovante de água recebido atualiza competência;
- marcar energia recebida atualiza competência;
- card desaparece quando todas as pendências são concluídas;
- interface funciona bem no celular.

### Não fazer nesta fase

- não integrar WhatsApp;
- não gerar mensagem ao proprietário ainda, salvo botão placeholder;
- não criar desconto ainda.

---

## 12. Fase 8 — Cobranças

### Objetivo

Criar a lógica de inadimplência.

### Entregas

- página Cobranças;
- geração de cobrança D+5;
- evolução por estágios;
- resolução automática quando comprovante de aluguel for recebido.

### Regras

Cobrança aparece quando:

- contrato está ativo;
- aluguel venceu há 5 dias ou mais;
- não existe comprovante de aluguel recebido;
- contrato está dentro do ciclo financeiro válido.

Estágios:

- D+5;
- D+7;
- D+10;
- D+15;
- D+20;
- D+30;
- decisão manual.

### Critérios de aceite

- sem comprovante após D+5 gera cobrança;
- comprovante recebido resolve cobrança;
- Booz ou Loft não impedem cobrança;
- cobrança mostra inquilino, imóvel, vencimento e estágio;
- não há cobrança duplicada para a mesma competência.

### Não fazer nesta fase

- não enviar WhatsApp;
- não automatizar mensagens externas;
- não tomar decisão jurídica automática.

---

## 13. Fase 9 — Repasses dentro de Essa Semana

### Objetivo

Integrar repasse ao card operacional da competência.

### Entregas

- criar registros de repasse;
- calcular valor bruto;
- calcular taxa de administração;
- calcular taxa de intermediação;
- calcular descontos, quando houver;
- calcular valor líquido;
- marcar repasse concluído;
- salvar data automática.

### Regras

Contrato comum:

- repasse aparece após comprovante de aluguel recebido.

Contrato com Booz ou Loft:

- repasse pode aparecer mesmo sem comprovante;
- mostrar texto: “Repasse liberado — fiança Booz” ou “Repasse liberado — fiança Loft”.

Ao marcar repasse concluído:

- salvar data atual;
- salvar valor repassado;
- não marcar automaticamente comprovante do aluguel enviado;
- não marcar automaticamente comprovante de desconto enviado.

### Critérios de aceite

- repasse comum só aparece após comprovante;
- repasse Booz/Loft aparece sem comprovante;
- Booz/Loft não marca aluguel como pago;
- valor líquido é calculado corretamente;
- cálculo é exibido discriminado;
- repasse concluído registra data.

### Não fazer nesta fase

- não remover dados antigos;
- não criar integração bancária;
- não enviar mensagem externa ainda.

---

## 14. Fase 10 — Descontos no Repasse

### Objetivo

Criar módulo de descontos que impacta o repasse.

### Entregas

- página Descontos no Repasse;
- botão + Registrar desconto;
- formulário de desconto;
- desconto único;
- desconto parcelado;
- aplicação automática no repasse;
- checkpoint de comprovante do valor descontado enviado.

### Campos

- tipo;
- especificação obrigatória;
- valor;
- contrato ativo;
- desconto único ou parcelado;
- quantidade de parcelas;
- observações.

### Tipos

- reparo;
- conta;
- outro.

### Regras

- campo Especificar é obrigatório em todos os tipos;
- desconto só pode ser criado para contrato ativo;
- desconto ativo impacta o próximo repasse aplicável;
- desconto parcelado avança apenas quando o repasse é concluído;
- desconto deve aparecer discriminado no cálculo do repasse.

### Critérios de aceite

- cria desconto único;
- cria desconto parcelado;
- não salva sem especificação;
- aplica desconto no repasse correto;
- desconto aparece discriminado;
- parcela não avança sem repasse concluído;
- card não some se falta comprovante do desconto enviado.

---

## 15. Fase 11 — Mensagem ao proprietário

### Objetivo

Gerar texto operacional para prestação de contas do repasse.

### Entregas

- botão “Gerar mensagem ao proprietário” no card de repasse;
- mensagem com cálculo discriminado;
- inclusão de desconto, se houver;
- indicação de comprovantes.

### Mensagem deve incluir

- proprietário;
- imóvel;
- inquilino;
- valor do aluguel;
- taxa aplicada;
- desconto aplicado;
- especificação do desconto;
- valor final repassado;
- data do repasse, se concluído;
- menção aos comprovantes enviados.

### Critérios de aceite

- mensagem sem desconto é gerada corretamente;
- mensagem com desconto inclui reparo/conta/outro;
- mensagem com intermediação mostra intermediação;
- mensagem com administração mostra administração;
- texto é claro e pronto para copiar.

### Não fazer nesta fase

- não enviar WhatsApp automaticamente;
- não integrar com e-mail;
- não anexar arquivos automaticamente.

---

## 16. Fase 12 — IPTU

### Objetivo

Criar controle de IPTU anual e parcelado.

### Entregas

- cadastro de IPTU;
- cota única;
- parcelado;
- parcelas;
- vínculo com imóvel/contrato;
- exibição em Essa Semana quando aplicável.

### Regras

- IPTU pode ser cota única ou parcelado;
- responsável pode ser proprietário ou inquilino;
- IPTU parcelado não antecipa parcelas futuras;
- só aparece parcela aplicável à competência;
- ao marcar parcela paga, ela some da competência atual;
- próxima parcela aparece apenas na competência correta.

### Critérios de aceite

- criar IPTU cota única;
- criar IPTU parcelado;
- marcar parcela como paga;
- IPTU quitado não aparece;
- parcela futura não aparece antes da hora.

---

## 17. Fase 13 — Água e Energia

### Objetivo

Criar controle mensal de água e energia.

### Água

Regras:

- água é controlada por competência;
- aparece checkpoint “Comprovante de água recebido” quando aplicável.

### Energia

Regras:

- energia só aparece se `cemigHolder = OWNER`;
- se `cemigHolder = TENANT` ou `THIRD_PARTY`, não gerar pendência.

### Critérios de aceite

- água aparece quando aplicável;
- água marcada como recebida some;
- energia aparece para titularidade proprietário;
- energia não aparece para inquilino/terceiro.

---

## 18. Fase 14 — Contratos vencendo

### Objetivo

Criar alertas de contratos próximos ao vencimento.

### Regras

- alertar quando faltar 30 dias ou menos;
- permitir marcar Renovado;
- permitir marcar Em desocupação;
- Renovado exige nova data de término;
- Em desocupação não encerra financeiramente o contrato.

### Critérios de aceite

- contrato a 30 dias do fim mostra alerta;
- renovar exige nova data;
- salvar nova data remove alerta;
- em desocupação remove alerta de renovação;
- em desocupação mantém obrigações financeiras válidas.

---

## 19. Fase 15 — Dashboard

### Objetivo

Criar painel de alertas.

### O Dashboard deve mostrar

- cobranças em atraso;
- repasses pendentes;
- contratos vencendo;
- alerta anual de IPTU em 10 de março;
- resumo das pendências críticas;
- botão para Essa Semana.

### Regra

Dashboard alerta, mas não executa.

### Critérios de aceite

- mostra resumo correto;
- não altera dados ao abrir;
- alerta 10 de março aparece;
- botão leva para Essa Semana.

---

## 20. Fase 16 — Relatórios anuais

### Objetivo

Criar controle inicial de relatórios anuais.

### Entregas

- listar relatórios por proprietário/contrato/ano;
- status: não gerado, gerado, enviado;
- marcar como gerado;
- marcar como enviado;
- registrar data.

### Critérios de aceite

- criar relatório anual;
- marcar gerado;
- marcar enviado;
- registrar datas;
- filtrar por ano/proprietário.

---

## 21. Fase 17 — Auditoria

### Objetivo

Registrar eventos importantes.

### Eventos mínimos

- contrato criado;
- contrato editado;
- competência criada;
- comprovante recebido;
- cobrança gerada;
- cobrança resolvida;
- repasse concluído;
- desconto criado;
- desconto aplicado;
- IPTU pago;
- relatório gerado;
- relatório enviado;
- contrato renovado;
- contrato em desocupação;
- contrato encerrado.

### Critérios de aceite

- ações importantes geram log;
- log mostra data, ação e entidade;
- log pode ser consultado por contrato.

---

## 22. Fase 18 — Backup/exportação

### Objetivo

Criar exportação simples de dados.

### Entregas

- exportar dados principais em JSON;
- futuramente CSV;
- incluir contratos, competências, cobranças, repasses, descontos e logs.

### Critérios de aceite

- gera arquivo JSON;
- arquivo contém dados principais;
- exportação não altera dados.

---

## 23. Fora do MVP inicial

Não implementar no MVP inicial:

- WhatsApp Business API;
- OCR/IA de comprovantes;
- integração bancária;
- assinatura digital;
- app mobile nativo;
- multiempresa;
- permissões complexas;
- envio automático de mensagens;
- anexos obrigatórios;
- importação massiva;
- relatórios PDF avançados.

Esses pontos ficam para fases futuras.

---

## 24. Como trabalhar com Codex

Cada fase deve ser implementada com prompt próprio.

O prompt deve conter:

- objetivo da fase;
- arquivos relevantes;
- regras que não podem ser quebradas;
- critérios de aceite;
- o que não deve ser alterado.

Nunca pedir ao Codex:

> “Construa o sistema todo.”

Preferir:

> “Implemente a Fase 3: Cadastros-base, seguindo os arquivos docs/01 a docs/05.”

---

## 25. Ordem resumida das fases

1. Base técnica do projeto.
2. Schema Prisma e migração inicial.
3. Cadastros-base.
4. Contratos.
5. Regras utilitárias centrais.
6. Competências mensais.
7. Essa Semana.
8. Cobranças.
9. Repasses dentro de Essa Semana.
10. Descontos no Repasse.
11. Mensagem ao proprietário.
12. IPTU.
13. Água e Energia.
14. Contratos vencendo.
15. Dashboard.
16. Relatórios anuais.
17. Auditoria.
18. Backup/exportação.

---

## 26. Regra final do roadmap

A velocidade do projeto deve ser controlada pela estabilidade das regras financeiras.

É melhor avançar devagar e corretamente do que criar muitas telas com lógica inconsistente.

O MVP só deve avançar para a próxima fase quando a fase atual estiver funcionando, testada e coerente com os documentos de negócio.