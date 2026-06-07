# /continuar — Salvar contexto para nova sessão

Quando este comando for invocado, compile o estado atual do projeto e salve em `.claude/handoff.md` dentro do próprio projeto para que qualquer nova sessão possa continuar de onde parou.

## O que fazer

1. Rode `git log --oneline -15` para ver os commits recentes
2. Leia os arquivos mais relevantes se precisar de detalhes do estado atual
3. Leia `.claude/handoff.md` se já existir (para não perder contexto anterior)
4. Sobrescreva `.claude/handoff.md` com o estado atualizado (veja formato abaixo)
5. Exiba o resumo para o usuário

## Formato de `.claude/handoff.md`

```markdown
# Handoff — Figurinhas Copa 2026 Web
> Atualizado em: <data atual>

## Última sessão — o que foi feito
- <bullet por feature/fix feito>

## Estado atual das features
- **Álbum** (`/album`): <estado>
- **Repetidas**: <estado>
- **Explorar / Matching** (`/explore`): <estado>
- **Perfil de usuário** (`/user/[id]`): <estado>
- **Trocas** (`/trades`): <estado>
- **Chat** (`/chat`): <estado>
- **Autenticação**: <estado>
- **Dark mode**: <estado>

## Decisões técnicas ativas (não óbvias pelo código)
- <decisão>: <motivo>

## Próximos passos
- [ ] <tarefa>

## Stack e deploy
- Next.js 15 + TypeScript + Tailwind + Supabase + Vercel
- Repo: `carlosribeiro-ui/figurinhas-copa2026-web` (branch `master`)
- Produção: https://figurinhas-copa2026-web.vercel.app
- Deploy: `vercel --prod` na raiz

## Commits recentes
<output do git log>
```

## Saída para o usuário

Ao final mostre:

```
✅ Contexto salvo em .claude/handoff.md

Na próxima sessão, o Claude vai ler esse arquivo automaticamente.
Se não ler, diga: "leia o .claude/handoff.md e continue de onde paramos."

Resumo salvo:
- [bullets principais]
```
