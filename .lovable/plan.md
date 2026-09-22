# Área do administrador

Painel interno para a equipe do Achados & Perdidos ver as solicitações de retirada e aprovar ou recusar cada uma.

## Acesso

- Nova página de login em `/admin/login` (e-mail e senha). O site público continua sem login.
- Só quem tiver o papel de administrador entra no painel; qualquer outra conta vê "acesso restrito".
- O primeiro administrador é criado por você: me diga o e-mail e eu cadastro o acesso.

## Painel `/admin`

- Lista de solicitações, mais recentes primeiro, com filtro por situação (Pendentes, Em análise, Aprovadas, Recusadas, Concluídas).
- Cada linha mostra: número #APR-, objeto solicitado (código ACH-, nome, foto), nome do solicitante, data do pedido e situação.
- Ao abrir uma solicitação: resumo do objeto + todos os dados informados (nome, CPF, telefone, e-mail, matrícula, data e local da perda, característica exclusiva) e o comprovante anexado, quando houver. Esses dados aparecem somente aqui, para o administrador.
- Ações: "Marcar em análise", "Aprovar retirada" e "Recusar", com campo opcional de observação interna.
- Ao aprovar: a solicitação vira "Aprovada" e o objeto passa para "Reservado", saindo da busca pública. As outras solicitações do mesmo objeto são marcadas como recusadas.
- Botão "Marcar como entregue" depois da aprovação: objeto vira "Entregue" e a solicitação "Concluída".

## Aviso de e-mail

Nesta etapa não há envio de e-mail. Na tela de aprovação aparece o texto que será enviado no futuro ("Sua solicitação foi aprovada, retire o objeto no Achados & Perdidos") e um aviso de que o envio automático ainda não está ativo. Quando você quiser, ativamos o e-mail com um domínio seu.

## Detalhes técnicos

- Ativar login por e-mail/senha no backend; criar `app_role` enum + tabela `user_roles` com função `has_role` (security definer) e GRANTs.
- Novas colunas em `recovery_requests`: `admin_note text`, `reviewed_at timestamptz`.
- Políticas RLS: SELECT/UPDATE em `recovery_requests` e SELECT/UPDATE em `found_items` para `authenticated` apenas quando `has_role(auth.uid(),'admin')`.
- Rotas sob `src/routes/_authenticated/admin/*` usando o gate existente; dados via server functions com `requireSupabaseAuth` chamadas do componente (não em loader público).
- Comprovantes e fotos exibidos por URL assinada dos buckets privados.
