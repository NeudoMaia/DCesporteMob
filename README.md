# DCESPORTE — AppWeb de orientação térmica e esportiva

Portal responsivo para consultar condições térmicas em Fortaleza, apoiar o planejamento de atividades físicas e mostrar orientações preventivas. A página inicial apresenta o briefing do atleta; o mapa, a calculadora de hidratação e as diretrizes complementam a consulta.

## Informações disponíveis ao usuário

- Temperatura, umidade, vento e radiação da estação de referência mais próxima.
- WBGT/IBUTG estimado, classificação de risco e recomendações por modalidade.
- Mapa e ranking das estações, alertas e calculadora de hidratação.
- Localização opcional no navegador para selecionar a estação mais próxima. As coordenadas são usadas localmente e não são enviadas ao servidor.
- Nome de exibição e preferência de tema claro/escuro salvos somente no navegador atual; o tema segue a configuração do dispositivo na primeira visita.

## Origem e limitações dos dados

- `VITE_DATA_MODE=simulation` é o padrão e não consulta a Plugfield nem o Gemini.
- `VITE_DATA_MODE=live` habilita a busca no backend. Configure as credenciais somente no ambiente do servidor; variáveis `VITE_*` são públicas no navegador.
- As estações Plugfield fornecem leituras atuais. As séries históricas e projeções do protótipo são estimativas geradas localmente, não observações consolidadas.
- O WBGT é estimado por fórmulas a partir de variáveis meteorológicas; não substitui instrumento WBGT/IBUTG no local do treino nem avaliação profissional. O portal não é um serviço de emergência ou diagnóstico.
- O acesso ao portal do atleta é público. A tela inicial pode guardar um nome de exibição e a preferência de tema no armazenamento local do navegador; esses dados não são sincronizados nem identificam uma conta. Não há autenticação de usuário nem dados pessoais persistidos no servidor.

## Executar localmente

Requer Node.js 24, conforme declarado em `package.json`.

1. Instale as dependências: `npm ci`.
2. Copie `.env.example` para `.env`. Mantenha `VITE_DATA_MODE=simulation` para desenvolvimento seguro.
3. Execute `npm run dev`.
4. Valide com `npm run lint`, `npm run build` e `npm run security:check`.

Para executar o servidor Express de produção localmente, gere primeiro o frontend com `npm run build` e inicie com `npm start`.

## Arquitetura

- `src/`: SPA React/TypeScript, cálculos locais e visualizações; integrações são chamadas por `/api`.
- `api/stations.ts`: integração servidor-servidor com Plugfield, com cache curto de leitura e fallback estimado.
- `api/analyze.ts`: valida a entrada e chama Gemini quando configurado; sem chave, usa análise determinística.
- `server.ts`: servidor Express para Docker/VM; `api/` também pode ser executado como funções serverless.
- `dccalor/` e scripts Python: pipeline científico e de treinamento independente; não é dependência do fluxo do AppWeb.

O cache em memória reduz chamadas repetidas em uma instância. Para escalar várias instâncias com garantia de consistência e controle de chamadas, use cache compartilhado (por exemplo, Redis) e limite de taxa no gateway antes de habilitar integrações públicas.

## Implantação

Docker/VM: configure segredos no ambiente de execução e use `docker-compose.yml`/`nginx-dccalor.conf`. Vercel: `vercel.json` publica a SPA e encaminha as funções da pasta `api/`. Defina `VITE_DATA_MODE=live` somente após configurar e validar as integrações no ambiente de produção.

Nunca versione `.env`. Consulte [SECURITY.md](./SECURITY.md) para práticas de credenciais e resposta a vazamentos.
