# CRM Siarom – Sistema de Relatórios IA

Sistema de relatórios de atendimentos com IA, integrado ao Supabase e OpenAI.

## Configuração

1. **Instalar dependências** (obrigatório antes de rodar)
   - Abra o terminal na pasta `CRM SIAROM`
   - Execute: `npm install`
   - Se der erro de dependências, use: `npm install --legacy-peer-deps`
   - Ou dê duplo clique em `INSTALAR.bat`

2. **Variáveis de ambiente**
   - O `.env.local` já está configurado com Supabase
   - Edite se precisar alterar credenciais

3. **Rodar o projeto**
   - **Forma mais fácil:** Dê duplo clique em `RODAR.bat` (instala, inicia o servidor e abre o navegador)
   - **Ou no terminal:**
   ```bash
   npm run dev
   ```

Acesse [http://localhost:3001](http://localhost:3001).

## Conexão Supabase

- **URL:** `https://oluorruhpluvoouxjdeq.supabase.co`
- **Tabela principal:** `chats`
- O cliente Supabase usa `service_role` e deve ser usado apenas no servidor.

## Estrutura

- `app/` – Páginas e rotas (Next.js App Router)
- `lib/supabase.ts` – Cliente Supabase server-side
- `types/chat.ts` – Tipos da tabela chats
