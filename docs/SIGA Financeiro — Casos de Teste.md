# SIGA Financeiro — Casos de Teste

## 1. Objetivo deste documento

Este documento define casos práticos para testar o SIGA Financeiro.

Ele deve ser usado para verificar se o sistema está obedecendo às regras de negócio antes de avançar para novas fases.

O objetivo é evitar erros financeiros, duplicidade de obrigações, cobranças indevidas, repasses errados e pendências que não somem corretamente.

Regra principal:

> Nenhuma fase deve ser considerada concluída sem testes práticos.

---

## 2. Convenções usadas nos testes

### Datas

Os exemplos usam datas fictícias.

Quando necessário, ajustar para a data real do ambiente de teste.

### Valores

Todos os valores devem ser tratados como dinheiro, usando `Decimal` ou centavos inteiros.

Nunca usar `Float`.

### Competência

Formato esperado:

```text
YYYY-MM
```

Exemplo:

```text
2026-09
```

### Status esperados

Os testes usam termos operacionais, mas o banco pode usar enums equivalentes.

---

# 3. Testes de cadastro-base

## CT-001 — Cadastrar proprietário

### Cenário

Mariana cadastra um novo proprietário.

### Dados

```text
Nome: João Pereira
Telefone: (34) 99999-0000
E-mail: joao@email.com
```

### Resultado esperado

- proprietário é salvo;
- aparece na lista de proprietários;
- fica disponível para seleção em imóveis e contratos.

---

## CT-002 — Cadastrar inquilino

### Cenário

Mariana cadastra um novo inquilino.

### Dados

```text
Nome: Maria Oliveira
Telefone: (34) 98888-0000
E-mail: maria@email.com
```

### Resultado esperado

- inquilino é salvo;
- aparece na lista de inquilinos;
- fica disponível para seleção em contratos.

---

## CT-003 — Cadastrar imóvel

### Cenário

Mariana cadastra um imóvel vinculado a proprietário.

### Dados

```text
Proprietário: João Pereira
Título: Apartamento Centro
Endereço: Rua A, 100
Cidade: Conceição das Alagoas
Estado: MG
Status: Vago
```

### Resultado esperado

- imóvel é salvo;
- imóvel fica vinculado ao proprietário;
- imóvel aparece disponível para contrato.

---

# 4. Testes de contrato

## CT-004 — Cadastrar contrato comum ativo

### Cenário

Criar contrato comum com caução.

### Dados

```text
Proprietário: João Pereira
Inquilino: Maria Oliveira
Imóvel: Apartamento Centro
Aluguel: R$ 1.200,00
Data de início: 01/09/2026
Data de término: 31/08/2027
Vencimento: dia 10
Pagamento: Adiantado
Garantia: Caução
IPTU: Proprietário
CEMIG: Inquilino
Administração: Locação comum 10%
Intermediação: Isento
Status: Ativo
```

### Resultado esperado

- contrato é salvo;
- contrato aparece como ativo;
- contrato contém todos os campos financeiros;
- não gera cobrança automaticamente;
- não gera repasse automaticamente;
- não gera competência automaticamente, salvo se houver comando específico.

---

## CT-005 — Cadastrar contrato com Booz

### Cenário

Criar contrato com garantia Booz.

### Dados

```text
Garantia: Booz
Aluguel: R$ 1.000,00
Administração: Locação comum 10%
Intermediação: Isento
```

### Resultado esperado

- contrato é salvo com garantia Booz;
- Booz deve ser reconhecida como seguro/fiança;
- Booz não marca aluguel como pago;
- Booz pode liberar repasse futuramente;
- Booz não impede cobrança D+5.

---

## CT-006 — Cadastrar contrato com Loft

### Cenário

Criar contrato com garantia Loft.

### Dados

```text
Garantia: Loft
Aluguel: R$ 1.000,00
Administração: Locação comum 10%
Intermediação: Isento
```

### Resultado esperado

- contrato é salvo com garantia Loft;
- Loft deve ser reconhecida como seguro/fiança;
- Loft não marca aluguel como pago;
- Loft pode liberar repasse futuramente;
- Loft não impede cobrança D+5.

---

## CT-007 — Contrato em desocupação não encerra financeiro

### Cenário

Contrato ativo é marcado como em desocupação.

### Dados

```text
Status principal: Ativo
Situação auxiliar: Em desocupação
```

### Resultado esperado

- contrato continua ativo;
- alerta de renovação pode sumir;
- sistema continua respeitando obrigações até o último pagamento devido;
- não deve encerrar automaticamente o contrato.

---

# 5. Testes de competência mensal

## CT-008 — Gerar competência mensal válida

### Cenário

Gerar competência para contrato ativo dentro do ciclo financeiro.

### Dados

```text
Contrato ativo
Competência: 2026-09
Vencimento: dia 10
```

### Resultado esperado

- cria `MonthlyObligation`;
- competência = `2026-09`;
- vencimento = `10/09/2026`;
- não cria duplicidade;
- aparece em “Essa Semana” se houver pendência real.

---

## CT-009 — Impedir competência duplicada

### Cenário

Tentar gerar duas vezes a mesma competência para o mesmo contrato.

### Dados

```text
Contrato: Maria Oliveira
Competência: 2026-09
```

### Resultado esperado

- sistema mantém apenas uma competência;
- não duplica card em “Essa Semana”;
- não duplica cobrança;
- não duplica repasse.

---

## CT-010 — Não gerar competência para contrato encerrado

### Cenário

Contrato com status encerrado.

### Dados

```text
Status: Encerrado
Competência solicitada: 2026-09
```

### Resultado esperado

- sistema não cria nova competência;
- contrato não aparece em “Essa Semana”;
- contrato não aparece em cobranças novas;
- contrato não gera repasse novo.

---

## CT-011 — Não gerar competência após último pagamento devido

### Cenário

Contrato já passou do último pagamento devido.

### Dados

```text
Contrato terminou em: 31/08/2026
Competência solicitada: 2026-10
```

### Resultado esperado

- sistema não cria nova obrigação financeira;
- não aparece em “Essa Semana”;
- não aparece em Cobranças;
- não gera repasse novo.

---

## CT-012 — Pendência antiga permanece após fim financeiro

### Cenário

Contrato terminou, mas último repasse ainda não foi concluído.

### Dados

```text
Contrato terminou em: 31/08/2026
Competência antiga: 2026-08
Repasse: pendente
```

### Resultado esperado

- sistema não gera competência nova;
- pendência antiga continua visível;
- repasse antigo pode ser concluído;
- após concluir, card some.

---

# 6. Testes de “Essa Semana”

## CT-013 — Contrato com pendência aparece

### Cenário

Contrato ativo possui competência com aluguel pendente.

### Dados

```text
Competência: 2026-09
Aluguel: pendente
```

### Resultado esperado

- card aparece em “Essa Semana”;
- mostra inquilino;
- mostra imóvel;
- mostra competência;
- mostra checkpoint “Comprovante de aluguel recebido”.

---

## CT-014 — Contrato em dia não aparece

### Cenário

Todas as pendências da competência foram concluídas.

### Dados

```text
Aluguel: concluído
Água: concluída
Energia: não aplicável
IPTU: não aplicável
Repasse: concluído
Comprovantes enviados: concluídos
```

### Resultado esperado

- card não aparece em “Essa Semana”.

---

## CT-015 — Card desaparece após concluir tudo

### Cenário

Mariana conclui todas as pendências do card.

### Dados

```text
Comprovante de aluguel recebido: concluído
Comprovante de água recebido: concluído
Repasse concluído: concluído
Comprovante do aluguel enviado: concluído
```

### Resultado esperado

- card desaparece automaticamente;
- dados ficam salvos;
- ao recarregar a página, card continua ausente.

---

## CT-016 — Card permanece se falta comprovante do aluguel enviado

### Cenário

Repasse já foi concluído, mas comprovante do aluguel ainda não foi enviado ao proprietário.

### Dados

```text
Repasse: concluído
Comprovante do aluguel enviado: pendente
```

### Resultado esperado

- card continua em “Essa Semana”;
- mostra checkpoint “Comprovante do aluguel enviado”;
- ao marcar, card some se não houver outras pendências.

---

## CT-017 — Card permanece se falta comprovante de desconto enviado

### Cenário

Há desconto aplicado e repasse concluído, mas comprovante do desconto não foi enviado.

### Dados

```text
Desconto aplicado: sim
Repasse: concluído
Comprovante do valor descontado enviado: pendente
```

### Resultado esperado

- card continua em “Essa Semana”;
- mostra checkpoint “Comprovante do valor descontado enviado”;
- ao marcar, card some se não houver outras pendências.

---

# 7. Testes de aluguel e comprovante

## CT-018 — Marcar comprovante de aluguel recebido

### Cenário

Mariana marca o comprovante de aluguel como recebido.

### Dados

```text
Competência: 2026-09
Aluguel: pendente
```

### Resultado esperado

- `rentStatus` vira concluído;
- `rentProofReceivedAt` recebe data atual;
- cobrança aberta da competência é resolvida, se existir;
- repasse comum passa a poder aparecer;
- não marca automaticamente comprovante enviado ao proprietário.

---

## CT-019 — Recebido e enviado são ações diferentes

### Cenário

Mariana marca comprovante de aluguel recebido.

### Dados

```text
Comprovante recebido: marcado
Comprovante enviado ao proprietário: não marcado
```

### Resultado esperado

- comprovante recebido fica concluído;
- comprovante enviado continua pendente;
- o sistema não confunde as duas ações.

---

# 8. Testes de cobrança

## CT-020 — Cobrança D+5 aparece sem comprovante

### Cenário

Aluguel venceu há 5 dias e não há comprovante.

### Dados

```text
Vencimento: 10/09/2026
Data atual: 15/09/2026
Comprovante de aluguel recebido: não
Contrato: ativo
```

### Resultado esperado

- cobrança aparece em Cobranças;
- estágio = D+5;
- contrato aparece como pendente;
- não duplica cobrança se já existir uma para a competência.

---

## CT-021 — Cobrança D+7 evolui corretamente

### Cenário

Aluguel venceu há 7 dias e segue sem comprovante.

### Dados

```text
Vencimento: 10/09/2026
Data atual: 17/09/2026
Comprovante: não recebido
```

### Resultado esperado

- cobrança aparece em D+7;
- não cria nova cobrança duplicada;
- atualiza estágio da cobrança existente.

---

## CT-022 — Comprovante recebido resolve cobrança

### Cenário

Cobrança D+5 está aberta e Mariana recebe comprovante.

### Dados

```text
Cobrança: D+5 aberta
Comprovante de aluguel recebido: marcado
```

### Resultado esperado

- cobrança muda para resolvida;
- contrato deixa de aparecer como cobrança pendente;
- repasse pode aparecer conforme regra.

---

## CT-023 — Booz não impede cobrança

### Cenário

Contrato com Booz não enviou comprovante após D+5.

### Dados

```text
Garantia: Booz
Vencimento: 10/09/2026
Data atual: 15/09/2026
Comprovante: não recebido
```

### Resultado esperado

- cobrança aparece em D+5;
- Booz não marca aluguel como pago;
- Booz não resolve cobrança.

---

## CT-024 — Loft não impede cobrança

### Cenário

Contrato com Loft não enviou comprovante após D+5.

### Dados

```text
Garantia: Loft
Vencimento: 10/09/2026
Data atual: 15/09/2026
Comprovante: não recebido
```

### Resultado esperado

- cobrança aparece em D+5;
- Loft não marca aluguel como pago;
- Loft não resolve cobrança.

---

# 9. Testes de repasse

## CT-025 — Repasse comum não aparece sem comprovante

### Cenário

Contrato comum sem comprovante de aluguel recebido.

### Dados

```text
Garantia: Caução
Comprovante de aluguel recebido: não
```

### Resultado esperado

- repasse não aparece;
- sistema aguarda comprovante.

---

## CT-026 — Repasse comum aparece após comprovante

### Cenário

Contrato comum com comprovante recebido.

### Dados

```text
Garantia: Caução
Comprovante de aluguel recebido: sim
Aluguel: R$ 1.200,00
Administração: 10%
Intermediação: isento
```

### Resultado esperado

- repasse aparece;
- cálculo:
  - aluguel: R$ 1.200,00;
  - administração 10%: -R$ 120,00;
  - valor a repassar: R$ 1.080,00.

---

## CT-027 — Repasse Booz aparece sem comprovante

### Cenário

Contrato com Booz sem comprovante recebido.

### Dados

```text
Garantia: Booz
Comprovante de aluguel recebido: não
Aluguel: R$ 1.000,00
Administração: 10%
```

### Resultado esperado

- repasse aparece;
- exibe “Repasse liberado — fiança Booz”;
- não marca aluguel como pago;
- cobrança ainda pode aparecer após D+5.

---

## CT-028 — Repasse Loft aparece sem comprovante

### Cenário

Contrato com Loft sem comprovante recebido.

### Dados

```text
Garantia: Loft
Comprovante de aluguel recebido: não
Aluguel: R$ 1.000,00
Administração: 10%
```

### Resultado esperado

- repasse aparece;
- exibe “Repasse liberado — fiança Loft”;
- não marca aluguel como pago;
- cobrança ainda pode aparecer após D+5.

---

## CT-029 — Marcar repasse concluído

### Cenário

Mariana conclui o repasse.

### Dados

```text
Repasse pendente
Valor líquido: R$ 900,00
```

### Resultado esperado

- repasse muda para concluído;
- `transferredAt` recebe data atual;
- valor repassado fica salvo;
- não marca comprovante do aluguel enviado;
- não marca comprovante de desconto enviado.

---

# 10. Testes de taxas

## CT-030 — Administração 10%

### Cenário

Contrato comum com taxa de administração 10%.

### Dados

```text
Aluguel: R$ 1.000,00
Administração: Locação comum 10%
Intermediação: Isento
```

### Resultado esperado

```text
Taxa de administração: R$ 100,00
Valor a repassar: R$ 900,00
```

---

## CT-031 — Administração 20%

### Cenário

Contrato de temporada com taxa de administração 20%.

### Dados

```text
Aluguel: R$ 1.000,00
Administração: Temporada 20%
Intermediação: Isento
```

### Resultado esperado

```text
Taxa de administração: R$ 200,00
Valor a repassar: R$ 800,00
```

---

## CT-032 — Intermediação isenta

### Cenário

Contrato sem taxa de intermediação.

### Dados

```text
Aluguel: R$ 1.000,00
Intermediação: Isento
Administração: 10%
```

### Resultado esperado

- administração é cobrada normalmente;
- intermediação = R$ 0,00;
- valor a repassar = R$ 900,00.

---

## CT-033 — Intermediação 50% após três meses

### Cenário

Contrato com intermediação configurada como “50% após três meses”.

### Dados

```text
Aluguel: R$ 1.000,00
Intermediação: 50% após três meses
```

### Resultado esperado

- sistema deve respeitar a regra cadastrada;
- na competência em que a intermediação for aplicável, cobra intermediação;
- não soma administração na mesma competência da intermediação;
- valor da intermediação: R$ 500,00;
- valor a repassar nessa competência: R$ 500,00.

### Observação

A regra exata de “após três meses” deve ser validada no documento de regras antes da implementação final, para evitar ambiguidade operacional.

---

# 11. Testes de descontos no repasse

## CT-034 — Criar desconto único

### Cenário

Mariana registra desconto único de reparo.

### Dados

```text
Tipo: Reparo
Especificar: Reparo hidráulico no banheiro social
Valor: R$ 150,00
Contrato: Maria Oliveira
Desconto: único
```

### Resultado esperado

- desconto é salvo;
- status = ativo;
- cria uma parcela de desconto;
- desconto será aplicado ao próximo repasse aplicável.

---

## CT-035 — Não salvar desconto sem especificação

### Cenário

Mariana tenta salvar desconto sem preencher “Especificar”.

### Dados

```text
Tipo: Reparo
Especificar: vazio
Valor: R$ 150,00
```

### Resultado esperado

- sistema não salva;
- mostra erro claro;
- campo “Especificar” é obrigatório.

---

## CT-036 — Criar desconto parcelado

### Cenário

Desconto de R$ 300,00 parcelado em 3 vezes.

### Dados

```text
Tipo: Reparo
Especificar: Reparo no telhado
Valor total: R$ 300,00
Parcelas: 3
```

### Resultado esperado

- desconto é salvo;
- cria 3 parcelas de R$ 100,00;
- status inicial das parcelas = pendente;
- desconto aparece como ativo.

---

## CT-037 — Aplicar desconto único no repasse

### Cenário

Contrato com aluguel e desconto único.

### Dados

```text
Aluguel: R$ 1.200,00
Administração: 10%
Desconto: R$ 150,00
```

### Resultado esperado

```text
Aluguel: R$ 1.200,00
Administração 10%: -R$ 120,00
Desconto: Reparo hidráulico 1/1: -R$ 150,00
Valor a repassar: R$ 930,00
```

---

## CT-038 — Aplicar desconto parcelado no repasse

### Cenário

Contrato com desconto de R$ 300,00 em 3 parcelas.

### Dados

```text
Aluguel: R$ 1.200,00
Administração: 10%
Desconto: R$ 300,00 em 3 parcelas
Parcela atual: 1/3
```

### Resultado esperado

```text
Aluguel: R$ 1.200,00
Administração 10%: -R$ 120,00
Desconto: Reparo no telhado 1/3: -R$ 100,00
Valor a repassar: R$ 980,00
```

---

## CT-039 — Parcela de desconto não avança sem repasse concluído

### Cenário

Desconto parcelado está aplicado, mas repasse ainda não foi concluído.

### Dados

```text
Desconto: 1/3
Repasse: pendente
```

### Resultado esperado

- parcela continua 1/3;
- não avança para 2/3;
- mudar o mês sozinho não deve marcar parcela como aplicada.

---

## CT-040 — Parcela de desconto avança após repasse concluído

### Cenário

Repasse da competência é concluído.

### Dados

```text
Desconto: 1/3
Repasse: concluído
```

### Resultado esperado

- parcela 1/3 é marcada como aplicada;
- próxima competência poderá usar parcela 2/3;
- desconto continua ativo até a última parcela.

---

## CT-041 — Desconto concluído após última parcela

### Cenário

Desconto parcelado chega à última parcela e repasse é concluído.

### Dados

```text
Desconto: 3/3
Repasse: concluído
```

### Resultado esperado

- parcela 3/3 fica aplicada;
- desconto muda para concluído;
- não aparece mais em repasses futuros.

---

# 12. Testes de IPTU

## CT-042 — Criar IPTU cota única

### Cenário

Cadastrar IPTU anual em cota única.

### Dados

```text
Ano: 2027
Tipo: Cota única
Valor: R$ 800,00
Responsável: Proprietário
```

### Resultado esperado

- IPTU é salvo;
- cria obrigação única;
- aparece em “Essa Semana” quando aplicável.

---

## CT-043 — Criar IPTU parcelado

### Cenário

Cadastrar IPTU anual parcelado em 10 vezes.

### Dados

```text
Ano: 2027
Tipo: Parcelado
Valor total: R$ 1.000,00
Parcelas: 10
Responsável: Inquilino
```

### Resultado esperado

- IPTU é salvo;
- cria 10 parcelas de R$ 100,00;
- parcelas ficam pendentes;
- não exibe todas de uma vez em “Essa Semana”.

---

## CT-044 — IPTU parcelado mostra apenas parcela aplicável

### Cenário

IPTU parcelado em 10 vezes.

### Dados

```text
Competência atual: 2027-04
Parcela aplicável: 2/10
```

### Resultado esperado

- “Essa Semana” mostra apenas:
  - IPTU parcela 2/10 paga;
- não mostra parcela 3/10;
- não mostra parcelas futuras.

---

## CT-045 — Marcar parcela de IPTU como paga

### Cenário

Mariana marca a parcela atual como paga.

### Dados

```text
IPTU parcela 2/10
```

### Resultado esperado

- parcela 2/10 muda para paga;
- pendência some da competência atual;
- parcela 3/10 não aparece imediatamente;
- parcela 3/10 só aparece na competência correta.

---

## CT-046 — IPTU quitado não aparece

### Cenário

Todas as parcelas estão pagas.

### Dados

```text
IPTU: 10/10 parcelas pagas
```

### Resultado esperado

- IPTU fica quitado;
- não aparece em “Essa Semana”;
- não aparece como pendência no Dashboard.

---

## CT-047 — Alerta de IPTU em 10 de março

### Cenário

Dashboard aberto em 10 de março.

### Dados

```text
Data atual: 10/03/2027
```

### Resultado esperado

Dashboard mostra:

```text
Mariana, hoje é 10 de março: abrir processo dos IPTUs anuais.
```

Esse alerta aparece mesmo sem IPTU cadastrado.

---

# 13. Testes de água

## CT-048 — Água aparece quando pendente

### Cenário

Competência tem água pendente.

### Dados

```text
WaterStatus: PENDING
```

### Resultado esperado

- “Essa Semana” mostra:
  - Comprovante de água recebido.

---

## CT-049 — Marcar água recebida

### Cenário

Mariana marca água como recebida.

### Dados

```text
Comprovante de água recebido: marcado
```

### Resultado esperado

- água muda para concluída;
- `waterProofReceivedAt` recebe data atual;
- pendência de água some;
- card some se não houver outras pendências.

---

# 14. Testes de energia/CEMIG

## CT-050 — Energia aparece para CEMIG no proprietário

### Cenário

Contrato com energia em nome do proprietário.

### Dados

```text
CEMIG: Proprietário
```

### Resultado esperado

- competência gera pendência de energia;
- “Essa Semana” mostra:
  - Comprovante de energia recebido.

---

## CT-051 — Energia não aparece para CEMIG no inquilino

### Cenário

Contrato com energia em nome do inquilino.

### Dados

```text
CEMIG: Inquilino
```

### Resultado esperado

- não gera pendência de energia;
- “Essa Semana” não mostra comprovante de energia.

---

## CT-052 — Energia não aparece para CEMIG em terceiro

### Cenário

Contrato com energia em nome de terceiro.

### Dados

```text
CEMIG: Terceiro
```

### Resultado esperado

- não gera pendência de energia;
- “Essa Semana” não mostra comprovante de energia.

---

# 15. Testes de contrato vencendo

## CT-053 — Alerta 30 dias antes

### Cenário

Contrato vence em 30 dias.

### Dados

```text
Data atual: 01/08/2027
Data de término: 31/08/2027
```

### Resultado esperado

- sistema mostra alerta de contrato vencendo;
- alerta informa quantidade de dias;
- oferece ações:
  - Renovado;
  - Em desocupação.

---

## CT-054 — Renovar contrato exige nova data

### Cenário

Mariana clica em Renovado.

### Dados

```text
Ação: Renovado
Nova data de término: vazia
```

### Resultado esperado

- sistema não salva sem nova data;
- mostra erro pedindo novo prazo de encerramento.

---

## CT-055 — Renovar contrato com nova data

### Cenário

Mariana informa nova data de término.

### Dados

```text
Nova data de término: 31/08/2028
```

### Resultado esperado

- contrato é atualizado;
- alerta de vencimento some;
- contrato continua ativo;
- gera log de auditoria.

---

## CT-056 — Marcar em desocupação

### Cenário

Mariana marca contrato como em desocupação.

### Dados

```text
Ação: Em desocupação
```

### Resultado esperado

- `lifecycleStatus = MOVING_OUT`;
- alerta de renovação some;
- contrato continua ativo;
- obrigações financeiras continuam até último pagamento devido;
- gera log de auditoria.

---

# 16. Testes de mensagem ao proprietário

## CT-057 — Mensagem simples sem desconto

### Cenário

Repasse sem desconto.

### Dados

```text
Proprietário: João Pereira
Imóvel: Apartamento Centro
Inquilino: Maria Oliveira
Aluguel: R$ 1.200,00
Administração: R$ 120,00
Valor repassado: R$ 1.080,00
```

### Resultado esperado

Mensagem inclui:

- proprietário;
- imóvel;
- inquilino;
- aluguel;
- taxa de administração;
- valor repassado;
- menção ao comprovante do aluguel.

---

## CT-058 — Mensagem com desconto

### Cenário

Repasse com desconto de reparo.

### Dados

```text
Desconto: Reparo hidráulico 1/2
Valor do desconto: R$ 150,00
Valor repassado: R$ 930,00
```

### Resultado esperado

Mensagem inclui:

- descrição do reparo;
- parcela 1/2;
- valor descontado;
- valor final repassado;
- menção ao comprovante do desconto.

---

## CT-059 — Mensagem com fiança Booz

### Cenário

Repasse liberado por Booz.

### Dados

```text
Garantia: Booz
Comprovante de aluguel recebido: não
Repasse: liberado
```

### Resultado esperado

Mensagem deve indicar, se aplicável:

```text
Repasse liberado por fiança Booz.
```

Não deve dizer que o comprovante foi recebido se não foi.

---

## CT-060 — Mensagem com fiança Loft

### Cenário

Repasse liberado por Loft.

### Dados

```text
Garantia: Loft
Comprovante de aluguel recebido: não
Repasse: liberado
```

### Resultado esperado

Mensagem deve indicar, se aplicável:

```text
Repasse liberado por fiança Loft.
```

Não deve dizer que o comprovante foi recebido se não foi.

---

# 17. Testes de Dashboard

## CT-061 — Dashboard não altera dados

### Cenário

Mariana abre Dashboard.

### Resultado esperado

- nenhum status é alterado;
- nenhuma cobrança é resolvida;
- nenhum repasse é concluído;
- nenhuma competência é marcada como concluída.

---

## CT-062 — Dashboard mostra cobranças em atraso

### Cenário

Existem cobranças abertas.

### Dados

```text
Cobranças abertas: 3
```

### Resultado esperado

- Dashboard mostra resumo de cobranças;
- botão ou link leva para Cobranças.

---

## CT-063 — Dashboard mostra repasses pendentes

### Cenário

Existem repasses pendentes.

### Dados

```text
Repasses pendentes: 2
```

### Resultado esperado

- Dashboard mostra resumo;
- botão ou link leva para Essa Semana.

---

## CT-064 — Dashboard mostra contratos vencendo

### Cenário

Existem contratos vencendo em até 30 dias.

### Dados

```text
Contratos vencendo: 1
```

### Resultado esperado

- Dashboard mostra alerta;
- alerta não altera contrato automaticamente.

---

# 18. Testes de relatórios anuais

## CT-065 — Criar relatório anual

### Cenário

Criar relatório anual para proprietário.

### Dados

```text
Proprietário: João Pereira
Ano: 2027
```

### Resultado esperado

- relatório é criado;
- status inicial = não gerado.

---

## CT-066 — Marcar relatório como gerado

### Cenário

Mariana marca relatório como gerado.

### Resultado esperado

- status = gerado;
- `generatedAt` recebe data atual.

---

## CT-067 — Marcar relatório como enviado

### Cenário

Mariana marca relatório como enviado.

### Resultado esperado

- status = enviado;
- `sentAt` recebe data atual.

---

# 19. Testes de auditoria

## CT-068 — Criar contrato gera log

### Cenário

Contrato é criado.

### Resultado esperado

AuditLog registra:

- ação: contrato criado;
- contrato relacionado;
- data;
- usuário, se houver autenticação.

---

## CT-069 — Repasse concluído gera log

### Cenário

Mariana marca repasse como concluído.

### Resultado esperado

AuditLog registra:

- ação: repasse concluído;
- contrato;
- competência;
- valor repassado;
- data.

---

## CT-070 — Desconto criado gera log

### Cenário

Mariana cria desconto.

### Resultado esperado

AuditLog registra:

- ação: desconto criado;
- contrato;
- valor;
- descrição;
- data.

---

## CT-071 — IPTU pago gera log

### Cenário

Mariana marca IPTU/parcela como pago.

### Resultado esperado

AuditLog registra:

- ação: IPTU pago;
- contrato ou imóvel;
- parcela, se houver;
- data.

---

# 20. Testes de backup/exportação

## CT-072 — Exportar backup

### Cenário

Mariana exporta dados.

### Resultado esperado

- sistema gera arquivo JSON;
- arquivo contém dados principais;
- exportação não altera dados.

---

## CT-073 — Backup contém tabelas principais

### Cenário

Arquivo JSON gerado.

### Resultado esperado

Backup contém, quando existirem dados:

- proprietários;
- inquilinos;
- imóveis;
- contratos;
- competências;
- comprovantes;
- cobranças;
- repasses;
- descontos;
- IPTU;
- relatórios;
- logs.

---

# 21. Testes de segurança lógica

## CT-074 — Não usar Float para dinheiro

### Cenário

Verificação técnica do schema/código.

### Resultado esperado

- campos monetários usam `Decimal` ou centavos inteiros;
- nenhum cálculo financeiro usa `Float`.

---

## CT-075 — Não duplicar regra financeira na interface

### Cenário

Revisão do código.

### Resultado esperado

- cálculo de repasse está em função reutilizável;
- cálculo de cobrança está em função reutilizável;
- cálculo de competência está em função reutilizável;
- componentes visuais apenas exibem resultados e chamam ações.

---

## CT-076 — Não deletar histórico financeiro indevidamente

### Cenário

Registro financeiro possui histórico.

### Resultado esperado

- sistema evita exclusão física indevida;
- usa status como cancelado, encerrado ou inativo;
- logs permanecem disponíveis.

---

# 22. Testes de integração entre módulos

## CT-077 — Aluguel recebido libera repasse comum

### Cenário

Contrato comum com aluguel pendente.

### Ações

1. Marcar comprovante de aluguel recebido.
2. Abrir “Essa Semana”.

### Resultado esperado

- cobrança é resolvida se existir;
- repasse aparece;
- repasse calcula valor corretamente.

---

## CT-078 — Repasse concluído não encerra card se falta comprovante enviado

### Cenário

Repasse concluído, mas comprovante do aluguel não enviado.

### Resultado esperado

- card continua em “Essa Semana”;
- mostra checkpoint pendente;
- ao marcar checkpoint, card some.

---

## CT-079 — Desconto impacta mensagem ao proprietário

### Cenário

Repasse possui desconto aplicado.

### Ações

1. Gerar mensagem ao proprietário.

### Resultado esperado

- mensagem inclui desconto;
- mensagem inclui especificação;
- mensagem inclui valor final correto.

---

## CT-080 — Seguro/fiança libera repasse e mantém cobrança

### Cenário

Contrato Booz ou Loft sem comprovante após D+5.

### Resultado esperado

- repasse aparece em “Essa Semana” por fiança;
- cobrança aparece em Cobranças por falta de comprovante;
- sistema não marca aluguel como pago.

---

# 23. Casos críticos que nunca podem falhar

## CC-001 — Não cobrar contrato encerrado sem pendência antiga

Contrato encerrado sem pendência não deve gerar nova cobrança.

---

## CC-002 — Não gerar repasse duplicado

Uma competência não deve gerar mais de um repasse ativo para o mesmo contrato.

---

## CC-003 — Não duplicar competência

Um contrato não pode ter duas competências iguais.

---

## CC-004 — Não aplicar desconto duas vezes

Um desconto ou parcela de desconto não deve ser aplicado duas vezes na mesma competência.

---

## CC-005 — Não antecipar IPTU parcelado

IPTU parcelado não deve mostrar parcelas futuras antes da competência correta.

---

## CC-006 — Não tratar Booz/Loft como pagamento recebido

Seguro/fiança não é comprovante.

---

## CC-007 — Não esconder desconto no valor final

Todo desconto aplicado precisa aparecer discriminado.

---

## CC-008 — Não confundir comprovante recebido com comprovante enviado

Receber do inquilino e enviar ao proprietário são ações diferentes.

---

## CC-009 — Não avançar desconto parcelado sem repasse concluído

Parcela de desconto só avança depois que o repasse for concluído.

---

## CC-010 — Não executar ações pelo Dashboard

Dashboard alerta, mas não conclui tarefas.

---

# 24. Checklist mínimo antes de avançar de fase

Antes de avançar para a próxima fase, verificar:

```text
[ ] A fase atual roda sem erro.
[ ] As regras financeiras principais foram respeitadas.
[ ] Não há duplicidade de competência.
[ ] Não há duplicidade de cobrança.
[ ] Não há duplicidade de repasse.
[ ] Os cálculos aparecem discriminados.
[ ] Os cards somem somente quando todas as pendências acabam.
[ ] Logs importantes são registrados.
[ ] Interface funciona no celular.
[ ] Nenhuma regra foi duplicada desnecessariamente na interface.
```

---

# 25. Regra final dos testes

O sistema só deve ser considerado pronto para uso real quando os casos críticos forem aprovados.

Em sistema financeiro, erro silencioso é pior que tela incompleta.

Prioridade:

1. cálculo correto;
2. histórico preservado;
3. pendência certa na tela certa;
4. interface simples;
5. automação apenas depois da base confiável.