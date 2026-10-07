# Segurança de credenciais

## Configuração local e produção

- Copie `.env.example` para `.env` apenas no seu ambiente. Nunca versione `.env`.
- Configure `PLUGFIELD_USERNAME`, `PLUGFIELD_PASSWORD`, `PLUGFIELD_API_KEY` e `GEMINI_API_KEY` no gerenciador de segredos da plataforma de hospedagem. Em produção, não use arquivo `.env` no repositório.
- O endpoint de estações responde com erro de configuração quando as credenciais estiverem ausentes; ele não possui valores padrão.

## Antes de publicar

Execute `npm run security:check` e depois `npm run build`.

## Resposta a vazamento

Credenciais que já estiveram em um commit devem ser tratadas como comprometidas: revogue ou gere novas chaves no provedor, atualize os segredos no ambiente de hospedagem e invalide sessões/tokens ativos. A remoção do arquivo atual não remove os valores do histórico Git; para apagar o histórico, faça isso apenas em uma manutenção planejada com backup e coordenação da equipe.
