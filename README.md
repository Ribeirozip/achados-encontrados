# Achados Reunidos

Crie um MVP web responsivo chamado "Achados & Perdidos", voltado para uma instituição de ensino.

O objetivo do sistema é facilitar a recuperação de objetos perdidos dentro da instituição através de um sistema simples de MATCH entre:

- o que a pessoa perdeu;

- os objetos encontrados e cadastrados no banco de dados.

IMPORTANTE:

O MVP deve ser extremamente simples e ter apenas 3 páginas/fluxos principais:

1. ENCONTRAR MEU OBJETO — tela principal de busca e MATCH

2. SOLICITAR RETIRADA — cadastro e comprovação do proprietário

3. CADASTRAR ITEM ENCONTRADO — cadastro de objetos no banco

Não criar dashboard complexo, login tradicional ou várias páginas neste primeiro MVP.

Utilizar Supabase para banco de dados e armazenamento das imagens.

Toda a interface deve estar em português do Brasil.

==================================================

1. CONCEITO DA APLICAÇÃO

==================================================

A aplicação funciona da seguinte maneira:

A pessoa acessa a plataforma e informa características do objeto que perdeu através de TAGS.

Exemplo:

"O que você perdeu?"

[Óculos] [Preto] [Ray-Ban] [Armação metálica]

O sistema consulta o banco de objetos encontrados e apresenta possíveis correspondências.

Exemplo:

"Encontramos objetos que podem corresponder ao que você perdeu."

[Objeto 1]

Óculos

Preto

Encontrado na Biblioteca

12/09/2026

[Objeto 2]

Óculos

Preto

Encontrado no Bloco B

15/09/2026

A pessoa seleciona o objeto que acredita ser seu.

Depois disso, vai para o fluxo de solicitação de retirada, onde informa seus dados e fornece informações que permitam validar que o objeto realmente pertence a ela.

==================================================

2. PÁGINA 1 — ENCONTRAR MEU OBJETO

==================================================

Essa deve ser a principal página da aplicação.

Criar uma interface moderna, simples e muito intuitiva.

HEADER:

Logo:

"Achados & Perdidos"

Menu:

- Encontrar meu objeto

- Cadastrar item encontrado

Botão opcional:

"Sou responsável pelo sistema"

==================================================

HERO DA PÁGINA

==================================================

Título:

"Perdeu alguma coisa?"

Subtítulo:

"Descreva o que você perdeu e encontre possíveis correspondências entre os objetos encontrados na instituição."

Criar uma área de busca por TAGS.

Título:

"O que você perdeu?"

Criar um campo de entrada:

"Digite uma característica do objeto..."

Quando o usuário digitar uma característica e pressionar Enter, transformar o texto em uma TAG.

Exemplo:

[Óculos ×] [Preto ×] [Grande ×] [Ray-Ban ×]

Permitir várias tags.

Sugestões automáticas de tags:

Óculos

Preto

Azul

Branco

Celular

iPhone

Samsung

Mochila

Caderno

Carteira

Chave

Garrafa

Fone

Relógio

Documento

Cartão

Roupa

Tênis

Etc.

Também permitir que o usuário escreva tags personalizadas.

==================================================

BUSCA

==================================================

Botão:

"Encontrar meu objeto"

Ao clicar:

Consultar os objetos cadastrados no Supabase.

O sistema deve comparar as TAGS informadas pelo usuário com as características dos objetos cadastrados.

Criar um sistema simples de pontuação de MATCH.

Exemplo:

TAG correspondente = +20 pontos.

Quanto maior a quantidade de correspondências, maior o percentual.

Exemplo:

92% de correspondência

75% de correspondência

48% de correspondência

Não é necessário utilizar inteligência artificial nesse primeiro MVP.

Utilizar correspondência por:

- categoria

- nome

- tags

- cor

- marca

- modelo

- descrição

==================================================

RESULTADO DO MATCH

==================================================

Depois da busca, mostrar:

"Encontramos possíveis correspondências"

Criar cards dos objetos.

Cada card deve mostrar:

- Foto

- Tipo do objeto

- Nome

- Principais características

- Local onde foi encontrado

- Data em que foi encontrado

- Percentual aproximado de correspondência

Exemplo:

--------------------------------

92% de correspondência

[ FOTO ]

Óculos

Tags:

[preto] [óculos] [metálico]

Encontrado:

Biblioteca

Data:

12/09/2026

[Esse objeto é meu]

--------------------------------

IMPORTANTE:

Não mostrar informações pessoais da pessoa que encontrou o objeto.

Não mostrar detalhes extremamente específicos que permitam que qualquer pessoa reivindique o objeto sem comprovação.

==================================================

SELEÇÃO DO OBJETO

==================================================

Quando o usuário clicar:

"Esse objeto é meu"

abrir o segundo fluxo:

SOLICITAR RETIRADA.

==================================================

COMO FUNCIONA

==================================================

Ainda na primeira página, abaixo da área de busca, criar uma seção:

"Como funciona?"

Explicar em 3 passos:

01

DESCREVA

"Conte como era o objeto que você perdeu usando características como tipo, cor, marca e outros detalhes."

02

ENCONTRE

"O sistema compara sua descrição com os objetos encontrados e mostra possíveis correspondências."

03

RECUPERE

"Selecione o objeto, confirme sua identidade e solicite a retirada."

Adicionar uma observação:

"A seleção de um objeto não garante automaticamente a entrega. A equipe responsável poderá solicitar informações para confirmar que o item pertence a você."

==================================================

3. PÁGINA 2 — SOLICITAR RETIRADA

==================================================

Essa página só aparece depois que o usuário seleciona um objeto.

Título:

"Vamos confirmar que o objeto é seu"

Subtítulo:

"Preencha seus dados para solicitar a retirada do objeto."

Mostrar no topo um pequeno resumo do objeto selecionado:

[Foto]

Óculos

Preto

Encontrado na Biblioteca

12/09/2026

==================================================

DADOS DO PROPRIETÁRIO

==================================================

Campos obrigatórios:

Nome completo

CPF

Número de telefone

E-mail

Matrícula/identificação institucional

Criar máscara para CPF.

Criar máscara para telefone.

==================================================

DATA DA PERDA

==================================================

Campo:

"Quando você perdeu o objeto?"

Permitir:

- Data exata

- Data aproximada

Campo:

"Local onde acredita ter perdido"

==================================================

COMPROVAÇÃO DE PROPRIEDADE

==================================================

Título:

"Como podemos confirmar que esse objeto é seu?"

Texto:

"Conte algum detalhe que não aparece publicamente no cadastro do objeto."

Campo:

"Descreva uma característica exclusiva do seu objeto"

Exemplo de placeholder:

"Possui um pequeno risco na lateral direita, uma etiqueta interna ou algum detalhe específico..."

==================================================

COMPROVANTE OPCIONAL

==================================================

Criar campo de upload:

"Comprovante de propriedade (opcional)"

Aceitar:

- JPG

- PNG

- PDF

Texto:

"Você pode enviar uma foto, nota fiscal, imagem anterior do objeto ou outro documento que ajude a comprovar que ele pertence a você."

IMPORTANTE:

Esse campo deve ser OPCIONAL.

Não exigir comprovante quando o usuário não possuir.

==================================================

SOLICITAÇÃO DE RETIRADA

==================================================

Checkbox obrigatório:

"Declaro que as informações fornecidas são verdadeiras e que sou o legítimo proprietário ou possuidor do objeto selecionado."

Botão:

"Solicitar retirada"

Depois do envio:

Mostrar uma tela de sucesso:

"Solicitação enviada!"

"Recebemos suas informações. A equipe responsável irá analisar os dados e confirmar a retirada."

Mostrar:

Número da solicitação:

#APR-000123

Status:

"Em análise"

==================================================

4. PÁGINA 3 — CADASTRAR ITEM ENCONTRADO

==================================================

Criar uma página simples para pessoas que encontraram um objeto.

Título:

"Encontrou alguma coisa?"

Subtítulo:

"Cadastre o objeto para que o proprietário possa encontrá-lo."

==================================================

TIPO DE OBJETO

==================================================

Campo:

"Que tipo de objeto você encontrou?"

Criar seleção por TAGS.

Exemplos:

[Óculos]

[Celular]

[Mochila]

[Carteira]

[Chave]

[Garrafa]

[Fone]

[Relógio]

[Caderno]

[Documento]

[Cartão]

[Roupa]

[Outro]

Permitir selecionar uma ou mais categorias quando necessário.

==================================================

NOME DO OBJETO

==================================================

Campo:

"Nome do objeto"

Exemplos:

Óculos de grau

Garrafa térmica

Fone Bluetooth

Mochila preta

==================================================

CARACTERÍSTICAS / TAGS

==================================================

Criar campo:

"Adicione características"

O usuário poderá adicionar TAGS.

Exemplo:

[Preto ×]

[Grande ×]

[Metálico ×]

[Samsung ×]

As TAGS serão utilizadas posteriormente no sistema de MATCH.

==================================================

DESCRIÇÃO

==================================================

Campo:

"Descreva o objeto"

Placeholder:

"Adicione características que possam ajudar o proprietário a reconhecer o objeto."

==================================================

FOTO DO OBJETO

==================================================

Criar upload de imagem.

Título:

"Foto do objeto"

Texto:

"Adicione uma foto para facilitar a identificação."

A foto deve ser obrigatória para objetos comuns.

==================================================

REGRA PARA DOCUMENTOS E IDENTIDADES

==================================================

IMPORTANTE:

Se o objeto cadastrado for:

- RG

- CPF

- CNH

- Documento pessoal

- Cartão bancário

- Documento com informações pessoais

NÃO EXIGIR que a pessoa publique uma foto do documento no banco público.

Nesse caso:

- permitir cadastro sem foto pública;

- armazenar o registro apenas para uso interno;

- sinalizar o item como "Documento";

- impedir que informações sensíveis sejam exibidas publicamente.

Mostrar uma mensagem:

"Por segurança, documentos pessoais não terão suas informações ou imagens exibidas publicamente."

==================================================

LOCAL DO ENCONTRO

==================================================

Campo:

"Onde você encontrou?"

Criar opções:

- Biblioteca

- Sala de aula

- Laboratório

- Auditório

- Cantina

- Área externa

- Estacionamento

- Banheiro

- Outro

Também permitir descrição manual.

==================================================

DATA

==================================================

Campo:

"Quando encontrou?"

Data e horário.

==================================================

FINALIZAÇÃO

==================================================

Botão:

"Cadastrar objeto"

Após cadastrar:

Mostrar:

"Objeto cadastrado com sucesso!"

"Agora ele faz parte do banco de Achados & Perdidos e poderá ser encontrado por quem perdeu."

Gerar automaticamente um código:

ACH-000123

==================================================

5. BANCO DE DADOS

==================================================

Criar as seguintes tabelas no Supabase:

found_items

id

code

category

name

description

tags

brand

model

color

location

date_found

time_found

image_url

is_sensitive

status

created_at

Statuses:

available

reserved

delivered

closed

==================================================

SOLICITAÇÕES

==================================================

recovery_requests

id

request_code

found_item_id

full_name

cpf

phone

email

institutional_id

date_lost

location_lost

ownership_description

proof_url

status

created_at

Statuses:

pending

under_review

approved

rejected

completed

==================================================

6. SISTEMA DE MATCH

==================================================

Criar uma função para comparar as características informadas na primeira página com os objetos encontrados.

Exemplo:

Usuário informa:

[óculos]

[preto]

[metálico]

Objeto cadastrado:

Nome:

Óculos de grau

Tags:

[óculos]

[preto]

[metálico]

[grande]

Resultado:

3 de 4 características correspondentes.

MATCH:

75%

Ordenar os resultados do maior para o menor percentual.

Só mostrar objetos com pelo menos 30% de correspondência.

Se nenhum resultado for encontrado:

"Não encontramos uma correspondência no momento."

Botão:

"Tentar outra descrição"

==================================================

7. PROTEÇÃO DE DADOS

==================================================

Como o sistema coleta CPF, telefone e possíveis comprovantes, implementar cuidados básicos de privacidade.

Não exibir publicamente:

- CPF

- telefone

- e-mail

- matrícula

- comprovantes

- documentos pessoais

- dados de quem encontrou o objeto

Esses dados devem ficar disponíveis somente para o processo interno de análise.

Utilizar Supabase Row Level Security.

==================================================

8. DESIGN

==================================================

Criar visual moderno, tecnológico e institucional.

Estilo:

- Clean

- Jovem

- Simples

- Intuitivo

- Mobile first

Paleta:

Verde como cor principal

Branco

Cinza claro

Preto

Utilizar:

- Cards

- Tags/chips

- Inputs grandes

- Botões destacados

- Ícones simples

- Bordas arredondadas

- Espaçamento generoso

A página principal deve parecer mais uma ferramenta de busca do que um sistema administrativo.

==================================================

9. NAVEGAÇÃO

==================================================

O sistema deve possuir apenas três páginas principais:

/

ENCONTRAR MEU OBJETO

/cadastrar-item

CADASTRAR ITEM ENCONTRADO

/solicitar-retirada/:id

SOLICITAR RETIRADA

Na primeira página:

[Perdi alguma coisa]

→ permanece na própria página e utiliza o sistema de MATCH.

[Encontrei alguma coisa]

→ /cadastrar-item

Ao selecionar um resultado:

[Esse objeto é meu]

→ /solicitar-retirada/:id

==================================================

10. FLUXO PRINCIPAL

==================================================

FLUXO DO USUÁRIO QUE PERDEU:

Página inicial

↓

"Perdi alguma coisa"

↓

Digita TAGS

↓

[Óculos] [Preto] [Metálico]

↓

Sistema consulta banco

↓

Mostra possíveis matches

↓

Usuário seleciona objeto

↓

"Esse objeto é meu"

↓

Solicitar retirada

↓

Nome + CPF + telefone + e-mail + identificação

↓

Data e local da perda

↓

Descrição de característica exclusiva

↓

Comprovante opcional

↓

Solicitação enviada

↓

Status: Em análise

FLUXO DE QUEM ENCONTROU:

Página inicial

↓

"Encontrei alguma coisa"

↓

Cadastrar item encontrado

↓

Selecionar tipo

↓

Adicionar nome

↓

Adicionar TAGS

↓

Adicionar descrição

↓

Adicionar foto

↓

Informar local

↓

Informar data

↓

Cadastrar

↓

Objeto entra no banco

↓

Pode aparecer nos resultados de MATCH

==================================================

11. O QUE NÃO CRIAR NO MVP

==================================================

Não criar:

- Login tradicional

- Dashboard complexo

- Sistema de usuários completo

- Aplicativo mobile nativo

- WhatsApp

- E-mail automático

- Inteligência artificial

- Reconhecimento facial

- Reconhecimento automático de imagens

- Geolocalização

- Pagamentos

- Leilão

- Relatórios complexos

- Sistema acadêmico integrado

O objetivo é validar primeiro o conceito central:

"DESCREVER → ENCONTRAR MATCH → COMPROVAR → RETIRAR"

==================================================

12. EXPERIÊNCIA FINAL

==================================================

A aplicação deve ser extremamente simples.

Ao entrar, o usuário deve entender imediatamente:

"Eu perdi alguma coisa?"

→ descrevo o objeto e procuro.

"Eu encontrei alguma coisa?"

→ cadastro o objeto.

O principal elemento visual da aplicação deve ser o campo de TAGS e os resultados de MATCH.

Priorizar uma experiência semelhante a:

BUSCA

+

TAGS

+

MATCH

+

VALIDAÇÃO

+

RETIRADA

Criar o MVP funcional, conectado ao Supabase, com os três fluxos funcionando de ponta a ponta.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://achados-encontrados.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/547dadf5-8f50-4564-b0f9-2ee112634958).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
