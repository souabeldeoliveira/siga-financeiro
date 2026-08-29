# SIGA Financeiro — Modelo de Dados

## 1. Objetivo deste documento

Este documento define o modelo de dados inicial do SIGA Financeiro.

Ele deve servir como referência para criação do banco PostgreSQL, schema Prisma, relações entre tabelas e organização das informações principais do sistema.

O modelo foi pensado para:

- contratos de administração imobiliária;
- controle por competência mensal;
- rotina operacional em “Essa Semana”;
- cobranças;
- repasses;
- descontos no repasse;
- IPTU;
- água;
- energia;
- relatórios;
- auditoria;
- integrações futuras.

---

## 2. Princípio central do modelo

O banco deve seguir esta lógica:

> Contrato é a fonte da verdade.  
> Competência mensal é a unidade operacional.  
> Obrigações pertencem a uma competência.  
> Repasses, cobranças e descontos devem estar vinculados a contrato e competência.  
> Toda ação importante deve gerar histórico.

---

## 3. Entidades principais

Entidades iniciais recomendadas:

- `User`
- `Owner`
- `Tenant`
- `Property`
- `Contract`
- `MonthlyObligation`
- `PaymentProof`
- `Charge`
- `Transfer`
- `Discount`
- `DiscountInstallment`
- `IptuRecord`
- `IptuInstallment`
- `WaterRecord`
- `EnergyRecord`
- `AnnualReport`
- `AuditLog`

---

## 4. User

Representa usuários internos do sistema.

No MVP, provavelmente haverá apenas Mariana e, talvez, um usuário administrador.

### Campos sugeridos

```ts
User {
  id
  name
  email
  role
  createdAt
  updatedAt
}
```

### Campos

- `id`: identificador único;
- `name`: nome do usuário;
- `email`: e-mail de login;
- `role`: função do usuário;
- `createdAt`: data de criação;
- `updatedAt`: data de atualização.

### Roles possíveis

- `ADMIN`
- `OPERATOR`

---

## 5. Owner

Representa o proprietário do imóvel.

### Campos sugeridos

```ts
Owner {
  id
  name
  phone
  email
  document
  notes
  createdAt
  updatedAt
}
```

### Campos

- `id`: identificador único;
- `name`: nome do proprietário;
- `phone`: telefone;
- `email`: e-mail;
- `document`: CPF/CNPJ, se necessário;
- `notes`: observações;
- `createdAt`: data de criação;
- `updatedAt`: data de atualização.

### Relações

Um proprietário pode possuir vários imóveis e vários contratos.

---

## 6. Tenant

Representa o inquilino.

### Campos sugeridos

```ts
Tenant {
  id
  name
  phone
  email
  document
  notes
  createdAt
  updatedAt
}
```

### Campos

- `id`: identificador único;
- `name`: nome do inquilino;
- `phone`: telefone;
- `email`: e-mail;
- `document`: CPF/CNPJ, se necessário;
- `notes`: observações;
- `createdAt`: data de criação;
- `updatedAt`: data de atualização.

### Relações

Um inquilino pode estar vinculado a vários contratos ao longo do tempo.

---

## 7. Property

Representa o imóvel administrado.

### Campos sugeridos

```ts
Property {
  id
  ownerId
  title
  address
  city
  state
  status
  notes
  createdAt
  updatedAt
}
```

### Campos

- `id`: identificador único;
- `ownerId`: vínculo com o proprietário;
- `title`: nome curto do imóvel;
- `address`: endereço completo;
- `city`: cidade;
- `state`: estado;
- `status`: situação do imóvel;
- `notes`: observações;
- `createdAt`: data de criação;
- `updatedAt`: data de atualização.

### Status possíveis

- `OCCUPIED`
- `VACANT`
- `INACTIVE`

### Relações

Um imóvel pertence a um proprietário.

Um imóvel pode ter vários contratos ao longo do tempo, mas normalmente apenas um contrato ativo.

---

## 8. Contract

Representa o contrato de locação/administração.

Esta é uma das entidades centrais do sistema.

### Campos sugeridos

```ts
Contract {
  id
  ownerId
  tenantId
  propertyId

  rentAmount
  startDate
  endDate
  dueDay

  paymentType
  guaranteeType
  iptuResponsibility
  cemigHolder

  administrationFeeType
  administrationFeePercent

  intermediationFeeType
  intermediationFeePercent

  status
  lifecycleStatus

  notes

  createdAt
  updatedAt
}
```

### Campos principais

- `id`: identificador único;
- `ownerId`: proprietário vinculado;
- `tenantId`: inquilino vinculado;
- `propertyId`: imóvel vinculado;
- `rentAmount`: valor do aluguel;
- `startDate`: data de início;
- `endDate`: data de término;
- `dueDay`: dia de vencimento;
- `paymentType`: adiantado ou vencido;
- `guaranteeType`: caução, Booz ou Loft;
- `iptuResponsibility`: proprietário ou inquilino;
- `cemigHolder`: titularidade da energia/CEMIG;
- `administrationFeeType`: tipo da taxa de administração;
- `administrationFeePercent`: percentual da administração;
- `intermediationFeeType`: tipo da taxa de intermediação;
- `intermediationFeePercent`: percentual da intermediação;
- `status`: status principal;
- `lifecycleStatus`: situação auxiliar;
- `notes`: observações;
- `createdAt`: data de criação;
- `updatedAt`: data de atualização.

### Enums recomendados

```ts
PaymentType {
  ADVANCE
  ARREARS
}
```

```ts
GuaranteeType {
  CAUTION
  BOOZ
  LOFT
}
```

```ts
IptuResponsibility {
  OWNER
  TENANT
}
```

```ts
CemigHolder {
  TENANT
  OWNER
  THIRD_PARTY
}
```

```ts
AdministrationFeeType {
  COMMON_RENTAL_10
  SEASONAL_20
}
```

```ts
IntermediationFeeType {
  EXEMPT
  FIFTY_AFTER_THREE_MONTHS
}
```

```ts
ContractStatus {
  ACTIVE
  VACANT
  CLOSED
}
```

```ts
ContractLifecycleStatus {
  NORMAL
  EXPIRING
  RENEWED
  MOVING_OUT
}
```

### Observação importante

O status `MOVING_OUT` não deve encerrar o contrato financeiramente.

O contrato só deixa de gerar novas obrigações após o último pagamento devido.

---

## 9. MonthlyObligation

Representa a competência mensal de um contrato.

Esta é a entidade mais importante para a rotina operacional.

### Campos sugeridos

```ts
MonthlyObligation {
  id
  contractId

  competence
  dueDate

  rentStatus
  waterStatus
  energyStatus
  iptuStatus
  transferStatus
  chargeStatus

  rentProofReceivedAt
  waterProofReceivedAt
  energyProofReceivedAt

  rentProofSentToOwnerAt
  discountProofSentToOwnerAt

  createdAt
  updatedAt
}
```

### Campos

- `id`: identificador único;
- `contractId`: contrato vinculado;
- `competence`: competência no formato `YYYY-MM`;
- `dueDate`: vencimento financeiro da competência;
- `rentStatus`: status do aluguel;
- `waterStatus`: status da água;
- `energyStatus`: status da energia;
- `iptuStatus`: status do IPTU;
- `transferStatus`: status do repasse;
- `chargeStatus`: status de cobrança;
- `rentProofReceivedAt`: quando o comprovante de aluguel foi recebido;
- `waterProofReceivedAt`: quando o comprovante de água foi recebido;
- `energyProofReceivedAt`: quando o comprovante de energia foi recebido;
- `rentProofSentToOwnerAt`: quando o comprovante de aluguel foi enviado ao proprietário;
- `discountProofSentToOwnerAt`: quando o comprovante do desconto foi enviado ao proprietário;
- `createdAt`: data de criação;
- `updatedAt`: data de atualização.

### Competence

Formato recomendado:

```text
YYYY-MM
```

Exemplo:

```text
2026-09
```

### Enums recomendados

```ts
ObligationStatus {
  NOT_APPLICABLE
  PENDING
  COMPLETED
}
```

```ts
TransferStatus {
  NOT_APPLICABLE
  PENDING
  COMPLETED
}
```

```ts
ChargeStatus {
  NONE
  D5
  D7
  D10
  D15
  D20
  D30
  MANUAL_DECISION
  RESOLVED
}
```

### Regra

A página “Essa Semana” deve ser alimentada principalmente por `MonthlyObligation`.

---

## 10. PaymentProof

Representa comprovantes recebidos.

Pode ser usado para comprovante de aluguel, água, energia, IPTU ou desconto.

### Campos sugeridos

```ts
PaymentProof {
  id
  contractId
  monthlyObligationId

  type
  fileUrl
  originalFileName
  amount
  paidAt
  receivedAt

  analysisStatus
  notes

  createdAt
  updatedAt
}
```

### Campos

- `id`: identificador único;
- `contractId`: contrato vinculado;
- `monthlyObligationId`: competência vinculada;
- `type`: tipo de comprovante;
- `fileUrl`: URL do arquivo, se houver upload;
- `originalFileName`: nome original do arquivo;
- `amount`: valor identificado ou informado;
- `paidAt`: data do pagamento;
- `receivedAt`: data em que o comprovante foi recebido;
- `analysisStatus`: status da análise;
- `notes`: observações;
- `createdAt`: data de criação;
- `updatedAt`: data de atualização.

### Tipos possíveis

```ts
ProofType {
  RENT
  WATER
  ENERGY
  IPTU
  DISCOUNT
  OTHER
}
```

### Status de análise

```ts
ProofAnalysisStatus {
  NOT_ANALYZED
  APPROVED
  NEEDS_REVIEW
  REJECTED
}
```

### Observação

Mesmo sem OCR/IA no MVP, essa tabela deve estar preparada para análise futura.

---

## 11. Charge

Representa cobrança por atraso.

### Campos sugeridos

```ts
Charge {
  id
  contractId
  monthlyObligationId

  stage
  status

  createdAt
  lastMessageAt
  resolvedAt

  notes
  updatedAt
}
```

### Campos

- `id`: identificador único;
- `contractId`: contrato vinculado;
- `monthlyObligationId`: competência vinculada;
- `stage`: estágio da cobrança;
- `status`: status da cobrança;
- `createdAt`: data de criação;
- `lastMessageAt`: data da última mensagem ou ação;
- `resolvedAt`: data de resolução;
- `notes`: observações;
- `updatedAt`: data de atualização.

### Estágios

```ts
ChargeStage {
  D5
  D7
  D10
  D15
  D20
  D30
  MANUAL_DECISION
}
```

### Status

```ts
ChargeRecordStatus {
  OPEN
  RESOLVED
  CANCELLED
}
```

### Regra

A cobrança deve surgir quando:

- contrato está ativo;
- competência está dentro do ciclo financeiro válido;
- aluguel venceu há 5 dias ou mais;
- não existe comprovante de aluguel recebido.

---

## 12. Transfer

Representa o repasse ao proprietário.

### Campos sugeridos

```ts
Transfer {
  id
  contractId
  monthlyObligationId
  ownerId

  grossRentAmount
  administrationFeeAmount
  intermediationFeeAmount
  discountAmount
  netTransferAmount

  isReleasedByGuarantee
  guaranteeType

  status
  transferredAt

  rentProofSentToOwnerAt
  discountProofSentToOwnerAt

  createdAt
  updatedAt
}
```

### Campos

- `id`: identificador único;
- `contractId`: contrato vinculado;
- `monthlyObligationId`: competência vinculada;
- `ownerId`: proprietário vinculado;
- `grossRentAmount`: valor bruto do aluguel;
- `administrationFeeAmount`: valor da taxa de administração;
- `intermediationFeeAmount`: valor da taxa de intermediação;
- `discountAmount`: total de descontos aplicados;
- `netTransferAmount`: valor líquido a repassar;
- `isReleasedByGuarantee`: indica se foi liberado por Booz/Loft;
- `guaranteeType`: garantia que liberou, se houver;
- `status`: status do repasse;
- `transferredAt`: data de conclusão;
- `rentProofSentToOwnerAt`: data de envio do comprovante do aluguel ao proprietário;
- `discountProofSentToOwnerAt`: data de envio do comprovante de desconto;
- `createdAt`: data de criação;
- `updatedAt`: data de atualização.

### Status

```ts
TransferRecordStatus {
  PENDING
  COMPLETED
  CANCELLED
}
```

### Regra

Em contrato comum, o repasse só aparece após o comprovante de aluguel recebido.

Em contrato com Booz ou Loft, o repasse pode aparecer mesmo sem comprovante, com indicação de liberação por fiança/seguro.

---

## 13. Discount

Representa desconto registrado para abater no repasse.

### Campos sugeridos

```ts
Discount {
  id
  contractId

  type
  description
  totalAmount
  installmentCount
  installmentAmount

  status
  notes

  createdAt
  updatedAt
}
```

### Campos

- `id`: identificador único;
- `contractId`: contrato vinculado;
- `type`: tipo de desconto;
- `description`: especificação obrigatória;
- `totalAmount`: valor total do desconto;
- `installmentCount`: quantidade de parcelas;
- `installmentAmount`: valor da parcela;
- `status`: status do desconto;
- `notes`: observações;
- `createdAt`: data de criação;
- `updatedAt`: data de atualização.

### Tipos

```ts
DiscountType {
  REPAIR
  BILL
  OTHER
}
```

### Status

```ts
DiscountStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}
```

### Regra

O campo `description` é obrigatório para todos os tipos.

Não deve existir desconto sem contrato ativo vinculado no momento da criação.

---

## 14. DiscountInstallment

Representa cada parcela de um desconto.

### Campos sugeridos

```ts
DiscountInstallment {
  id
  discountId
  contractId
  monthlyObligationId

  installmentNumber
  totalInstallments
  amount

  status
  appliedAt

  createdAt
  updatedAt
}
```

### Campos

- `id`: identificador único;
- `discountId`: desconto vinculado;
- `contractId`: contrato vinculado;
- `monthlyObligationId`: competência onde a parcela foi ou será aplicada;
- `installmentNumber`: número da parcela;
- `totalInstallments`: total de parcelas;
- `amount`: valor da parcela;
- `status`: status da parcela;
- `appliedAt`: data em que a parcela foi aplicada/consolidada;
- `createdAt`: data de criação;
- `updatedAt`: data de atualização.

### Status

```ts
DiscountInstallmentStatus {
  PENDING
  APPLIED
  CANCELLED
}
```

### Regra

A parcela de desconto só deve avançar para `APPLIED` quando o repasse da competência for concluído.

---

## 15. IptuRecord

Representa o IPTU anual de um imóvel/contrato.

### Campos sugeridos

```ts
IptuRecord {
  id
  contractId
  propertyId

  year
  type
  responsibility

  totalAmount
  installmentCount

  status

  createdAt
  updatedAt
}
```

### Campos

- `id`: identificador único;
- `contractId`: contrato vinculado, quando aplicável;
- `propertyId`: imóvel vinculado;
- `year`: ano do IPTU;
- `type`: cota única ou parcelado;
- `responsibility`: proprietário ou inquilino;
- `totalAmount`: valor total;
- `installmentCount`: quantidade de parcelas;
- `status`: status geral;
- `createdAt`: data de criação;
- `updatedAt`: data de atualização.

### Tipos

```ts
IptuType {
  SINGLE
  INSTALLMENT
}
```

### Status

```ts
IptuStatus {
  PENDING
  PARTIALLY_PAID
  PAID
  CANCELLED
}
```

---

## 16. IptuInstallment

Representa parcela de IPTU.

### Campos sugeridos

```ts
IptuInstallment {
  id
  iptuRecordId
  monthlyObligationId

  installmentNumber
  totalInstallments
  amount
  dueDate

  status
  paidAt

  createdAt
  updatedAt
}
```

### Campos

- `id`: identificador único;
- `iptuRecordId`: IPTU anual vinculado;
- `monthlyObligationId`: competência vinculada, quando aplicável;
- `installmentNumber`: número da parcela;
- `totalInstallments`: total de parcelas;
- `amount`: valor;
- `dueDate`: vencimento;
- `status`: status da parcela;
- `paidAt`: data de pagamento;
- `createdAt`: data de criação;
- `updatedAt`: data de atualização.

### Status

```ts
IptuInstallmentStatus {
  PENDING
  PAID
  CANCELLED
}
```

### Regra

A página “Essa Semana” deve mostrar apenas a parcela aplicável à competência atual.

Não deve antecipar parcelas futuras.

---

## 17. WaterRecord

Representa controle de água por competência.

### Campos sugeridos

```ts
WaterRecord {
  id
  contractId
  monthlyObligationId

  status
  proofReceivedAt
  amount
  notes

  createdAt
  updatedAt
}
```

### Campos

- `id`: identificador único;
- `contractId`: contrato vinculado;
- `monthlyObligationId`: competência vinculada;
- `status`: status;
- `proofReceivedAt`: data em que o comprovante foi recebido;
- `amount`: valor, se informado;
- `notes`: observações;
- `createdAt`: data de criação;
- `updatedAt`: data de atualização.

### Status

```ts
UtilityStatus {
  NOT_APPLICABLE
  PENDING
  COMPLETED
}
```

---

## 18. EnergyRecord

Representa controle de energia/CEMIG por competência.

### Campos sugeridos

```ts
EnergyRecord {
  id
  contractId
  monthlyObligationId

  status
  proofReceivedAt
  amount
  notes

  createdAt
  updatedAt
}
```

### Regra

Só deve ser criado ou aparecer como pendência quando a titularidade da CEMIG for do proprietário.

Se a titularidade for inquilino ou terceiro, não deve gerar obrigação.

---

## 19. AnnualReport

Representa relatório anual para proprietário.

### Campos sugeridos

```ts
AnnualReport {
  id
  ownerId
  propertyId
  contractId

  year
  status

  generatedAt
  sentAt

  fileUrl
  notes

  createdAt
  updatedAt
}
```

### Campos

- `id`: identificador único;
- `ownerId`: proprietário vinculado;
- `propertyId`: imóvel vinculado;
- `contractId`: contrato vinculado, quando aplicável;
- `year`: ano do relatório;
- `status`: status;
- `generatedAt`: data de geração;
- `sentAt`: data de envio;
- `fileUrl`: arquivo gerado, se houver;
- `notes`: observações;
- `createdAt`: data de criação;
- `updatedAt`: data de atualização.

### Status

```ts
AnnualReportStatus {
  NOT_GENERATED
  GENERATED
  SENT
}
```

---

## 20. AuditLog

Registra eventos importantes do sistema.

### Campos sugeridos

```ts
AuditLog {
  id
  userId
  contractId
  entityType
  entityId

  action
  message
  metadata

  createdAt
}
```

### Campos

- `id`: identificador único;
- `userId`: usuário responsável, quando houver;
- `contractId`: contrato relacionado, quando aplicável;
- `entityType`: tipo da entidade alterada;
- `entityId`: id da entidade alterada;
- `action`: ação realizada;
- `message`: descrição resumida;
- `metadata`: dados extras em JSON;
- `createdAt`: data do evento.

### Eventos importantes

- contrato criado;
- contrato editado;
- competência criada;
- comprovante recebido;
- cobrança gerada;
- cobrança resolvida;
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

## 21. Relações principais

### Owner

- possui muitos `Property`;
- possui muitos `Contract`;
- possui muitos `Transfer`;
- possui muitos `AnnualReport`.

### Tenant

- possui muitos `Contract`.

### Property

- pertence a um `Owner`;
- possui muitos `Contract`;
- possui muitos `IptuRecord`;
- possui muitos `AnnualReport`.

### Contract

- pertence a um `Owner`;
- pertence a um `Tenant`;
- pertence a um `Property`;
- possui muitas `MonthlyObligation`;
- possui muitos `PaymentProof`;
- possui muitas `Charge`;
- possui muitos `Transfer`;
- possui muitos `Discount`;
- possui muitos `IptuRecord`;
- possui muitos `WaterRecord`;
- possui muitos `EnergyRecord`;
- possui muitos `AnnualReport`;
- possui muitos `AuditLog`.

### MonthlyObligation

- pertence a um `Contract`;
- possui muitos `PaymentProof`;
- pode possuir uma `Charge`;
- pode possuir um `Transfer`;
- pode possuir registros de água, energia, IPTU e desconto.

---

## 22. Índices recomendados

Criar índices para consultas frequentes.

### Contract

- `ownerId`
- `tenantId`
- `propertyId`
- `status`
- `endDate`
- `dueDay`

### MonthlyObligation

- `contractId`
- `competence`
- `dueDate`
- `rentStatus`
- `transferStatus`
- `chargeStatus`

Recomendado índice único:

```text
contractId + competence
```

### Charge

- `contractId`
- `monthlyObligationId`
- `stage`
- `status`

### Transfer

- `contractId`
- `monthlyObligationId`
- `ownerId`
- `status`

### Discount

- `contractId`
- `status`

### IptuRecord

- `propertyId`
- `contractId`
- `year`
- `status`

### AuditLog

- `contractId`
- `entityType`
- `entityId`
- `createdAt`

---

## 23. Regras de integridade

### RI-001 — Contrato não existe sem proprietário, inquilino e imóvel

Todo contrato deve ter:

- `ownerId`;
- `tenantId`;
- `propertyId`.

---

### RI-002 — Competência não existe sem contrato

Toda `MonthlyObligation` deve ter `contractId`.

---

### RI-003 — Uma competência por contrato por mês

Não deve existir mais de uma `MonthlyObligation` para o mesmo contrato e a mesma competência.

---

### RI-004 — Desconto exige descrição

Todo `Discount` deve ter `description`.

---

### RI-005 — Desconto exige contrato

Todo `Discount` deve estar vinculado a um contrato.

---

### RI-006 — Cobrança exige competência

Toda `Charge` deve estar vinculada a uma `MonthlyObligation`.

---

### RI-007 — Repasse exige competência

Todo `Transfer` deve estar vinculado a uma `MonthlyObligation`.

---

### RI-008 — Comprovante exige contrato

Todo `PaymentProof` deve estar vinculado a um contrato.

Preferencialmente, também deve estar vinculado a uma competência.

---

### RI-009 — Valores monetários

Valores monetários devem ser armazenados em centavos ou em tipo decimal seguro.

Recomendação:

- usar `Decimal` no Prisma/PostgreSQL; ou
- armazenar centavos como inteiro.

Não usar `float` para dinheiro.

---

## 24. Campos monetários

Campos monetários importantes:

- `Contract.rentAmount`
- `PaymentProof.amount`
- `Transfer.grossRentAmount`
- `Transfer.administrationFeeAmount`
- `Transfer.intermediationFeeAmount`
- `Transfer.discountAmount`
- `Transfer.netTransferAmount`
- `Discount.totalAmount`
- `Discount.installmentAmount`
- `DiscountInstallment.amount`
- `IptuRecord.totalAmount`
- `IptuInstallment.amount`
- `WaterRecord.amount`
- `EnergyRecord.amount`

Regra:

> Não usar ponto flutuante para valores financeiros.

---

## 25. Datas importantes

Campos de data relevantes:

### Contract

- `startDate`
- `endDate`

### MonthlyObligation

- `competence`
- `dueDate`
- `rentProofReceivedAt`
- `waterProofReceivedAt`
- `energyProofReceivedAt`
- `rentProofSentToOwnerAt`
- `discountProofSentToOwnerAt`

### Charge

- `createdAt`
- `lastMessageAt`
- `resolvedAt`

### Transfer

- `transferredAt`
- `rentProofSentToOwnerAt`
- `discountProofSentToOwnerAt`

### DiscountInstallment

- `appliedAt`

### IptuInstallment

- `dueDate`
- `paidAt`

### AnnualReport

- `generatedAt`
- `sentAt`

---

## 26. Observações para o Prisma

O schema Prisma deve refletir:

- enums claros;
- relações explícitas;
- cascatas com cuidado;
- campos `createdAt` e `updatedAt`;
- índices de consulta;
- constraint única para `contractId + competence`.

Evitar deletar registros financeiros em cascata sem análise.

Preferir status `CANCELLED` ou `INACTIVE` quando houver histórico financeiro.

---

## 27. Estratégia de exclusão

Evitar deletar fisicamente dados financeiros importantes.

Preferir:

- status `CANCELLED`;
- status `INACTIVE`;
- campo `deletedAt`, se necessário.

Entidades sensíveis:

- contratos;
- competências;
- cobranças;
- repasses;
- descontos;
- comprovantes;
- IPTU;
- logs.

---

## 28. Entidades para fases futuras

Podem ser adicionadas depois:

- `WhatsappMessage`
- `Notification`
- `Document`
- `BankTransaction`
- `OwnerStatement`
- `ContractRenewal`
- `MaintenanceRequest`

Não devem ser prioridade do MVP inicial.

---

## 29. Ordem recomendada de implementação do banco

### Etapa 1

Criar:

- `User`
- `Owner`
- `Tenant`
- `Property`
- `Contract`

### Etapa 2

Criar:

- `MonthlyObligation`
- `PaymentProof`

### Etapa 3

Criar:

- `Charge`
- `Transfer`

### Etapa 4

Criar:

- `Discount`
- `DiscountInstallment`

### Etapa 5

Criar:

- `IptuRecord`
- `IptuInstallment`
- `WaterRecord`
- `EnergyRecord`

### Etapa 6

Criar:

- `AnnualReport`
- `AuditLog`

---

## 30. Resumo executivo do modelo

O modelo de dados do SIGA Financeiro deve ser orientado por contrato e competência mensal.

As tabelas centrais são:

- `Contract`;
- `MonthlyObligation`;
- `Transfer`;
- `Charge`;
- `Discount`.

A tabela `MonthlyObligation` é o núcleo operacional.

A página “Essa Semana” deve consultar principalmente competências mensais com pendências reais.

A cobrança, o repasse, o desconto, o IPTU, a água e a energia devem sempre estar vinculados a uma competência e a um contrato.

O sistema deve preservar histórico e evitar exclusão física de registros financeiros.