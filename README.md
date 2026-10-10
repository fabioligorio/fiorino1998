# Fiorino 1998 — arquivos persistentes (versão 2)

## Como os dados são salvos

- No computador: `npm run dev` abre http://127.0.0.1:4399 e grava em `data/items.json` nesta pasta. Cada alteração arquiva a versão anterior em `data/backups/`. O servidor local só aceita conexões do próprio computador e não pede senha.
- Na Vercel: a API `/api/items` lê e grava o arquivo privado `fiorino-1998/items.json` no Vercel Blob. Versões anteriores ficam em `fiorino-1998/backups/`. Os arquivos persistem após novas publicações.
- O navegador não é mais o armazenamento principal. Cadastro, edição, exclusão e importação só são confirmados depois que a API salva o arquivo. Sem conexão, nenhuma alteração é confirmada.
- A mesma URL publicada e a mesma senha permitem acessar a lista pelo celular ou computador. Use Atualizar lista para obter alterações de outro dispositivo. Edições simultâneas são rejeitadas se a revisão do arquivo mudou; o formulário permanece aberto para conferência.
- O arquivo na nuvem não é sincronizado automaticamente com a pasta da Área de Trabalho. Use Exportar backup para baixar uma cópia local atualizada.

## Configuração na Vercel (necessária)

1. Envie este projeto ao GitHub e importe na Vercel. Preset Other, nenhum comando de build, Output Directory `public`. A configuração está no vercel.json.
2. Na aba Storage do projeto, crie/conecte um **Vercel Blob privado**. A conexão deve disponibilizar `BLOB_READ_WRITE_TOKEN` no ambiente de produção.
3. Em Settings → Environment Variables, crie `FIORINO_PASSWORD` com uma senha forte, exclusiva, de pelo menos 16 caracteres. Não envie essa senha em chat nem a coloque no código. O aplicativo mantém a senha apenas na memória da aba e a transmite à API pelo HTTPS da Vercel.
4. Faça novo deploy após configurar as variáveis. Abra a URL publicada e entre com a senha. A primeira leitura cria o arquivo com os cinco itens iniciais.
5. Teste um cadastro e confira se ele aparece ao entrar em outro navegador. A integração real com o Blob precisa dessa configuração e não foi testada em sua conta.

Use stores separados para Preview e Production para que testes não alterem os dados reais. Não altere nem apague o Blob ao republicar o site. Configure limitação de requisições no Firewall da Vercel para `/api/items`. Não há recuperação de senha por e-mail: altere FIORINO_PASSWORD no painel e publique novamente. O serviço de armazenamento tem limites/custos conforme seu plano; as cópias se acumulam e não são excluídas automaticamente.

## Preservar os dados da versão anterior

Os cinco itens da conversa estão em `data/initial-items.json`. Se você já fez outras alterações na versão antiga, exporte seu backup nela e importe na nova versão. O botão Transferir dados da versão anterior também lê a lista antiga, quando estiver no mesmo navegador e no mesmo endereço. Nunca apaga esses dados antigos. Importação substitui a lista atual após confirmação e arquiva a versão anterior.

## Desenvolvimento e testes

Node.js 22 ou superior. Execute `npm install`, `npm test`, `npm run check` e `npm run dev`. Os testes cobrem persistência local, backups, validação, senha e conflitos. O teste de Blob usa um serviço simulado; não substitui validação na conta real.

O endpoint limita gravações a 3 MB. Os backups exportados usam JSON com version, project e items. Pode restaurar uma cópia automática baixada do Blob usando Importar backup.

## Estrutura

- public/: interface e código do navegador
- api/items.js: função da Vercel
- lib/: validação, autenticação e armazenamento
- data/initial-items.json: cinco itens iniciais
- data/items.json e data/backups/: dados locais (fora do Git)
- tests/: testes automatizados
- .env.example: nomes das variáveis, sem credenciais

Documentação oficial: https://vercel.com/docs/vercel-blob/private-storage e https://vercel.com/docs/vercel-blob/using-blob-sdk

## Conexões atuais com OIDC
O sistema aceita BLOB_STORE_ID ou BLOB_READ_WRITE_TOKEN_STORE_ID e usa a autenticação automática da Vercel. Nessas conexões, não é necessário criar BLOB_READ_WRITE_TOKEN manualmente. A variável de chave pública de webhook não é um token de acesso.
