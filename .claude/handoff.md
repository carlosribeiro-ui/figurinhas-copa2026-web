# Handoff — Figurinhas Copa 2026 Web
> Atualizado em: 2026-06-07

## Última sessão — o que foi feito
- Corrigida lógica de matching: **somente repetidas** contam para troca dos dois lados
- Removido conceito de "falta" — se não marcado no álbum = não tem (implícito)
- Explore: busca `quantity` do Supabase, calcula `theirDups` corretamente
- User profile: `theyCanOffer` = repetidas deles que eu não tenho; `canOfferDups` = minhas repetidas que eles não têm
- Adicionado botão "Abrir Chat" nas trocas aceitas (página `/trades`)
- Adicionado botão "Ver perfil e propor troca" nos cards do Explore
- Após enviar proposta, exibe link "Ver minhas propostas de troca"
- Criada skill `/continuar` em `.claude/commands/continuar.md`

## Estado atual das features

- **Álbum** (`/album`): Duas abas — "Álbum" e "Repetidas". Multi-select em ambas. Modal sem nome do jogador. Repetidas é status aditivo (quantity >= 2 em status='have').
- **Repetidas**: Aba separada com counter +/- no modal. Bulk actions: decrementar, zerar extras, remover.
- **Explorar / Matching** (`/explore`): Lista colecionadores. Matching correto usa apenas duplicatas dos dois lados. Badge "N repetidas compatíveis". Botão direto "Ver perfil e propor troca".
- **Perfil de usuário** (`/user/[id]`): Mostra "Repetidas deles que você não tem" e "Suas repetidas que eles não têm". Botão "Propor troca" habilitado só quando ambos têm repetidas compatíveis.
- **Trocas** (`/trades`): Abas Recebidas/Enviadas. Aceitar/Recusar. Botão "Abrir Chat" em trocas aceitas.
- **Chat** (`/chat`): Conversas vinculadas a trocas aceitas. Realtime via Supabase.
- **Autenticação**: Login, cadastro (confirmação de email), esqueci senha, reset de senha. Email visível no perfil (vem do auth, não da tabela profiles).
- **Dark mode**: Completo em todas as páginas. Toggle na sidebar. Sem hydration mismatch.

## Decisões técnicas ativas (não óbvias pelo código)

- **`status='duplicate'` é legado**: novo modelo usa `status='have'` + `quantity >= 2`. O hook `useStickers` trata ambos como `duplicateIds`.
- **Chat vinculado a troca**: não existe chat direto — só abre após troca aceita.
- **Hydration mismatch React 19**: resolvido com CSS `dark:hidden`/`dark:block` no toggle (sem estado React para tema). Inline script no `<head>` aplica classe antes do React bootar.
- **Email fora da tabela `profiles`**: lido do `user.email` da sessão auth e mesclado no AuthContext. Não precisa de coluna no banco.
- **GitHub CLI**: está em `C:/Program Files/GitHub CLI/gh.exe` — não está no PATH, usar caminho completo.

## Próximos passos (sugeridos)
- [ ] Badge na sidebar quando chega proposta de troca
- [ ] Ao aceitar troca, marcar figurinhas automaticamente no álbum
- [ ] Paginação no Explore (limite atual: 50 usuários)
- [ ] Filtro por cidade no Explore

## Stack e deploy
- Next.js 15 + TypeScript + Tailwind + Supabase + Vercel
- Repo: `carlosribeiro-ui/figurinhas-copa2026-web` (branch `master`)
- Produção: https://figurinhas-copa2026-web.vercel.app
- Deploy: `vercel --prod` na raiz do projeto

## Commits recentes
```
6a65c50 fix: trade matching uses only duplicates; improve trade/chat UX
4b2abf0 fix: implicit need — unowned stickers count as needed for matching
9e68586 fix: null-safety em username/full_name nas páginas explorar e perfil de usuário
3125391 fix: corrige application error causado por hydration mismatch no dark mode
5405f6a fix: texto branco em inputs, erro de cadastro e email no perfil
0bb28bf feat: dark mode completo + multi-select na aba Repetidas
11edece feat: esqueci senha, repetidas independentes e aba dedicada de repetidas
7dc4e8a feat: responsive layout, country dropdown, flag images, multi-select, FIFA codes
5f78b27 Initial commit: Figurinhas Copa 2026 Web (Next.js 15 + Tailwind)
```
