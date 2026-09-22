# Achados & Perdidos — MVP

Plataforma web responsiva (pt-BR) para reunir objetos perdidos e encontrados numa instituição de ensino, com busca por tags e cálculo de correspondência.

## Páginas

1. `/` — Encontrar meu objeto
   - Cabeçalho com logo "Achados & Perdidos" e menu (Encontrar meu objeto / Cadastrar item encontrado).
   - Hero: "Perdeu alguma coisa?" + subtítulo.
   - Campo de tags: digitar e pressionar Enter cria uma tag removível; sugestões prontas (óculos, preto, celular, mochila, carteira, chave, fone, relógio, documento, etc.) e tags livres.
   - Botão "Encontrar meu objeto" busca no banco e lista os resultados ordenados por percentual.
   - Cards de resultado: foto, tipo, nome, tags principais, local, data e percentual. Botão "Esse objeto é meu".
   - Estado vazio: "Não encontramos uma correspondência no momento." + "Tentar outra descrição".
   - Seção "Como funciona?" em 3 passos + aviso de que a seleção não garante a entrega.

2. `/cadastrar-item` — Cadastrar item encontrado
   - Tipo por tags (uma ou mais), nome, características em tags, descrição, foto, local (lista + opção "Outro" com texto livre), data e hora.
   - Foto obrigatória para objetos comuns.
   - Se o tipo for documento/cartão pessoal: foto não exigida, item marcado como sensível, nada exibido publicamente, com aviso de segurança na tela.
   - Sucesso: "Objeto cadastrado com sucesso!" + código ACH-000123.

3. `/solicitar-retirada/:id` — Solicitar retirada
   - Resumo do objeto selecionado no topo.
   - Dados: nome completo, CPF (com máscara), telefone (com máscara), e-mail, matrícula.
   - Data da perda (exata ou aproximada) e local onde acredita ter perdido.
   - Comprovação: descrição de característica exclusiva do objeto.
   - Comprovante opcional (JPG, PNG, PDF).
   - Declaração obrigatória + botão "Solicitar retirada".
   - Sucesso: número #APR-000123 e status "Em análise".

## Correspondência (match)

Compara as tags digitadas com categoria, nome, tags, cor, marca, modelo e descrição do item. Cada característica correspondente soma pontos; o percentual é a proporção de correspondências. Resultados abaixo de 30% não aparecem; ordenação do maior para o menor.

## Dados e privacidade

- Backend com Lovable Cloud (banco + armazenamento de imagens) — será ativado como primeiro passo.
- Tabela de itens encontrados: código, categoria, nome, descrição, tags, marca, modelo, cor, local, data/hora, imagem, marcação de sensível, status (disponível, reservado, entregue, encerrado).
- Tabela de solicitações: código, item, nome, CPF, telefone, e-mail, matrícula, data e local da perda, descrição de propriedade, comprovante, status (pendente, em análise, aprovada, recusada, concluída).
- Regras de acesso: qualquer pessoa pode ver apenas os itens não sensíveis e disponíveis, com campos públicos limitados; itens sensíveis e todos os dados pessoais das solicitações ficam restritos ao uso interno e nunca são exibidos no site. Comprovantes ficam em armazenamento privado.

## Design

Verde como cor principal, com branco, cinza claro e preto. Visual clean, jovem e institucional, mobile first: cards, chips, campos grandes, botões destacados, cantos arredondados e bastante respiro. A tela inicial parece uma ferramenta de busca, não um painel administrativo.

## Fora do escopo

Sem login, painel administrativo, e-mails automáticos, IA, geolocalização ou pagamentos.

## Detalhes técnicos

- TanStack Start + Tailwind, tokens de cor em `src/styles.css`.
- Rotas: `src/routes/index.tsx`, `src/routes/cadastrar-item.tsx`, `src/routes/solicitar-retirada.$id.tsx`, cada uma com metadados próprios.
- Leitura pública via cliente Supabase publicável em server functions com políticas `TO anon` restritas a itens não sensíveis; inserções de itens e solicitações via server functions com validação Zod.
- Códigos ACH-/APR- gerados por sequência no banco.
- Upload de fotos em bucket público (itens comuns) e comprovantes em bucket privado.
