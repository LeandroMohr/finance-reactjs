# Guia de e-mail, analytics/BI e AdSense

Referencia: 11/10/2026. Interfaces, precos e politicas podem mudar; confirme as condicoes nos links oficiais antes de contratar ou ativar servicos.

## 1. Escopo e recomendacao

Este guia descreve configuracoes operacionais e futuras. A integracao tecnica do AdSense foi
adicionada em 12/10/2026; aprovacao, deploy e configuracoes do painel continuam sendo etapas externas.
Nao significa que os demais servicos abaixo ja estejam habilitados.

- Site de producao: https://lemohr.com.br/.
- Hospedagem: Cloudflare Pages, projeto `finance-reactjs`, conectado ao GitHub.
- Publicacao: push na `main` dispara instalacao, testes, build e deploy.
- Validacao local: `yarn run build`, usando Yarn 1.22.22.
- Homologacao, branch `develop` e fluxo de PR ficam adiados por decisao do responsavel.
- Nao ha necessidade de backend ou banco proprio para as configuracoes iniciais deste guia.

Ordem recomendada: e-mail de contato, privacidade/consentimento, analytics e eventos, dashboard, preparacao editorial e AdSense.

| Objetivo | Ferramenta inicial | Custo e limite relevante |
| --- | --- | --- |
| Receber em `contato@lemohr.com.br` | Cloudflare Email Routing | Encaminhamento gratuito; nao inclui caixa postal |
| Receber e responder pelo dominio | Zoho Mail ou Google Workspace | Hospedagem de e-mail paga; confira o plano e a regiao |
| Trafego e desempenho | Cloudflare Web Analytics | Gratuito; nao substitui instrumentacao de eventos de produto |
| Interacoes e aquisicao | Google Analytics 4 (GA4) | Versao padrao sem custo; limites e requisitos de privacidade |
| Dashboard de BI | Google Data Studio, anteriormente Looker Studio | Versao padrao sem custo; conectores, quotas e recursos Pro podem cobrar |
| Receita com anuncios | Google AdSense | Cadastro sem taxa; exige aprovacao e cumprimento das politicas |

Manter contas sob seu controle, ativar autenticacao multifator e usar permissoes minimas. Nunca publicar senhas, tokens, credenciais SMTP ou dados bancarios no GitHub.

## 2. E-mail personalizado

### 2.1. Escolher o tipo de e-mail

Encaminhamento: uma mensagem para `contato@lemohr.com.br` chega a uma caixa existente, como Gmail. Nao existe uma nova caixa com senha, armazenamento ou webmail na Cloudflare.

Caixa postal: um provedor hospeda mensagens e permite enviar e receber como `contato@lemohr.com.br`, via webmail e, conforme o plano, SMTP/IMAP.

Recomendacao inicial: encaminhamento gratuito se voce aceita responder pelo e-mail pessoal. Se precisa de identidade profissional tambem nas respostas, contratar uma caixa postal.

### 2.2. Configurar o encaminhamento gratuito

Ferramentas: [Cloudflare Dashboard](https://dash.cloudflare.com/) e [guia oficial de Email Routing](https://developers.cloudflare.com/email-service/get-started/route-emails/).

1. Entre no painel da conta Cloudflare.
2. Abra `Compute > Email Service > Email Routing`. Algumas interfaces tambem exibem `Email > Email Routing` dentro do dominio.
3. Selecione `Onboard Domain` e escolha `lemohr.com.br`.
4. Revise e autorize os registros sugeridos: MX para recebimento e TXT para autenticacao, incluindo SPF/DKIM conforme o assistente.
5. Nao altere os CNAMEs do Pages, os servidores do Registro.br ou o HTTPS.
6. Em `Destination Addresses`, adicione a caixa pessoal que recebera as mensagens.
7. Abra nessa caixa a mensagem de verificacao e confirme o destino.
8. Em `Routing Rules`, crie a regra com endereco `contato`, acao `Send to an email` e destino verificado.
9. Opcionalmente, crie `privacidade` para solicitacoes de dados pessoais, usando a mesma caixa de destino.
10. Evite habilitar catch-all inicialmente: aceitar qualquer endereco do dominio pode aumentar spam.

Nao invente valores MX ou DKIM: copie os fornecidos pelo servico. Nao mantenha dois registros SPF separados no mesmo hostname; se adicionar outro emissor, revise uma politica SPF consolidada.

### 2.3. Testar e publicar o contato

1. Use uma conta diferente da caixa de destino para enviar a `contato@lemohr.com.br`.
2. Confira caixa de entrada e spam. Teste tambem uma mensagem com anexo pequeno.
3. Responda e confira qual endereco aparece no campo remetente para a outra pessoa.
4. Com apenas encaminhamento, a resposta normalmente sai pelo e-mail pessoal; isso e esperado.
5. Depois do teste, confirme que a pagina de contato do site anuncia um endereco funcional.

Para diagnosticar DNS no macOS:

```sh
dig MX lemohr.com.br +short
dig TXT lemohr.com.br +short
```

DNS pode levar ate 24 horas para propagar. A existencia de MX nao prova que a entrega funciona: o teste entre contas continua necessario.

### 2.4. Receber e enviar com uma caixa postal

Compare [Zoho Mail](https://www.zoho.com/mail/zohomail-pricing.html) e [Google Workspace](https://workspace.google.com/intl/pt-BR/). Teste gratuito nao significa plano gratuito permanente. Nao conte com um plano gratuito Zoho disponivel para toda regiao: confira a oferta efetiva no cadastro.

1. Escolha um plano com dominio personalizado e as formas de acesso desejadas.
2. Cadastre `lemohr.com.br` e crie a conta `contato`.
3. Verifique a propriedade com o TXT fornecido pelo provedor, adicionando-o ao DNS da Cloudflare.
4. Prepare a caixa e, se aplicavel, backup/importacao antes de trocar o recebimento.
5. Desative Email Routing para esse dominio antes de substituir seus MX pelos MX do novo provedor.
6. Configure SPF e DKIM com os valores oficiais. Os registros de autenticacao CNAME devem ficar `DNS only`, sem proxy.
7. Configure DMARC. Comece com monitoramento e um destino de relatorios realmente existente; endureca para `quarantine`/`reject` so depois de confirmar o alinhamento dos emissores legitimos.
8. Teste recebimento e envio para Gmail e outro provedor. Confira SPF, DKIM e DMARC nos cabecalhos.
9. Se quiser responder pelo Gmail pessoal, use `Enviar e-mail como` com o SMTP autenticado do provedor, quando o plano permitir. Apenas mudar o nome do remetente nao resolve autenticacao.

Nao use MX concorrentes de Cloudflare e outro provedor como se fossem caixas independentes: prioridade MX nao cria uma distribuicao por destinatario.

### 2.5. E-mails de sistemas futuros

Cadastro, recuperacao de senha e notificacoes sao e-mail transacional, diferente de uma caixa pessoal. Existem [Cloudflare Email Service](https://developers.cloudflare.com/email-service/), [Resend](https://resend.com/) e [Brevo](https://www.brevo.com/pt/).

Na referencia consultada, envio transacional Cloudflare esta em beta no Workers Paid. Encaminhamento continua disponivel no Free. Outros provedores possuem ofertas e quotas proprias; verificar limites atuais.

Essas integracoes exigem backend/Worker para proteger credenciais, verificar entradas e limitar abuso. Nao colocar chaves de envio em variaveis `NEXT_PUBLIC_*` nem chamar APIs secretas diretamente pelo navegador.

## 3. Analytics: o que medir

### 3.1. Diferenciar trafego, produto e BI

- Analytics de rede da Cloudflare: requisicoes, cache, seguranca e trafego, que podem incluir bots e varios arquivos por pagina.
- Cloudflare Web Analytics: visitas, paginas e desempenho observado no navegador.
- GA4: aquisicao, sessoes, engajamento e eventos instrumentados.
- BI: organiza dados coletados em indicadores e dashboards; nao coleta cliques sozinho.

Para este site, perguntas uteis sao: quais ferramentas atraem pessoas, quais sao utilizadas, onde o uso e interrompido, quem compartilha e quais canais trazem usuarios interessados.

### 3.2. Habilitar Cloudflare Web Analytics

Referencia: [ativar Web Analytics no Pages](https://developers.cloudflare.com/pages/how-to/web-analytics/).

1. Abra `Compute > Workers & Pages > finance-reactjs > Metrics`.
2. Em `Web Analytics`, selecione `Enable`.
3. Publique um novo deployment. A injecao do beacon acontece no proximo deploy, nao necessariamente no que ja esta online.
4. Abra o site, navegue em algumas paginas e confira `Web Analytics` no painel da conta.
5. Verifique visitas, paginas mais acessadas, referencias e Core Web Vitals.
6. Nao instale tambem o mesmo beacon manualmente: isso pode duplicar coleta.

Esse painel e uma base gratuita de trafego/desempenho, nao a solucao principal para eventos de simulacao. Mesmo uma ferramenta privacy-first deve constar no inventario de servicos e na politica do site conforme o uso.

### 3.3. Preparar privacidade antes de GA4 e anuncios

Recomendacao conservadora inicial: bloquear coleta de analytics nao essencial e publicidade ate a escolha do visitante, preservando o funcionamento das calculadoras mesmo com recusa.

1. Atualize a politica de privacidade: finalidade, ferramentas, categorias de dados, compartilhamento, retencao, contato e direitos.
2. Escolha uma plataforma de gestao de consentimento (CMP) ou implementacao adequada ao escopo; confira precos e cobertura.
3. Separe pelo menos preferencias de analytics e publicidade.
4. Ofereca aceitar, recusar e gerenciar preferencias, sem escolhas previamente aceitas para categorias opcionais.
5. Disponibilize reabertura das preferencias e revogacao.
6. Configure o estado antes de inicializar tags. Se usar Google Consent Mode, alinhe `analytics_storage`, `ad_storage`, `ad_user_data` e `ad_personalization`.
7. Comece com comportamento de bloqueio basico: nao carregar tags opcionais antes da autorizacao. O modo avancado pode enviar sinais sem cookies e exige avaliacao especifica.
8. Teste aceite, recusa, aceite parcial, revogacao e recarregamento.

Consent Mode transmite preferencias; nao substitui o banner/CMP nem cria por si so uma base legal. Uma mensagem regional do AdSense nao deve ser presumida como gestora completa do GA4 e das preferencias brasileiras.

Nao enviar nomes, e-mails, CPF, textos livres, saldos, aportes, resultados de carteira ou valores financeiros digitados aos sistemas de analytics. URLs e parametros de consulta tambem podem vazar informacoes: nao colocar entradas do simulador na URL coletada.

Isto e orientacao tecnica, nao parecer juridico. Consulte a [ANPD](https://www.gov.br/anpd/pt-br) e apoio especializado para a aplicacao da LGPD; usuarios de outros paises podem gerar obrigacoes adicionais.

### 3.4. Criar a propriedade GA4

Ferramentas: [Google Analytics](https://analytics.google.com/) e [guia de configuracao](https://support.google.com/analytics/answer/9304153?hl=pt-BR).

1. Crie uma conta, por exemplo `Leandro Mohr`, e uma propriedade `Lemo Finance`.
2. Configure fuso horario de Sao Paulo e moeda BRL.
3. Selecione objetivos relacionados a trafego e engajamento.
4. Crie fluxo `Web`, URL `https://lemohr.com.br`, nome `Site de producao`.
5. Anote o ID de medicao `G-...`. Ele e publico; nao e uma chave secreta de API.
6. Revise medicao otimizada. Para este site, evite inicialmente rastreamento automatico de formularios que possa confundir campos de simulacao com captacao de leads.
7. Escolha apenas uma instalacao: tag direta ou Google Tag Manager. Nao instalar as duas para a mesma propriedade.
8. Revise retencao; para exploracoes de uso, considere 14 meses se adequado a sua politica, em vez de reter sem necessidade.
9. Deixe Google Signals e personalizacao publicitaria desativados inicialmente, a menos que exista necessidade e configuracao de consentimento apropriada.

### 3.5. Instalar no projeto Next.js

Esta etapa exige codigo futuro; este guia nao instala tags.

Recomendacao inicial: tag direta, carregada de forma central e condicionada ao consentimento, usando as APIs de script da versao instalada do Next. O [Tag Manager](https://tagmanager.google.com/) e uma alternativa para administrar varias tags, mas adiciona outra camada de configuracao.

1. Defina o ID publico na configuracao ou em `NEXT_PUBLIC_GA_MEASUREMENT_ID` nas variaveis de build do Pages.
2. Restrinja coleta a `lemohr.com.br` e `www.lemohr.com.br`. Nao enviar eventos de localhost, `pages.dev` ou deployments temporarios.
3. Carregue a tag uma unica vez no ponto compartilhado da aplicacao, respeitando as preferencias.
4. Se a variavel publica mudar, gere outro build: na exportacao estatica, o valor e incorporado aos arquivos.
5. Configure page views nas navegacoes internas do Next, nao apenas no primeiro carregamento.
6. Escolha uma estrategia para `page_view`: medicao automatica por historico ou envio manual. Nao executar ambas para a mesma navegacao.
7. Valide mudancas de rota, voltar/avancar e recarregamento. Caminho, titulo e referencia precisam representar a pagina atual.
8. Se usar CSP, permitir apenas os destinos realmente necessarios de scripts e coleta, sem liberar indiscriminadamente todas as origens.

Referencia: [medicao de navegacao SPA no GA4](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications).

### 3.6. Plano de eventos das ferramentas

Defina os eventos antes da implementacao. Use nomes estaveis e parametros de baixa cardinalidade.

| Evento | Quando registrar | Parametros sugeridos |
| --- | --- | --- |
| `tool_open` | Ferramenta carregada e pronta | `tool_id` |
| `simulation_start` | Primeira interacao intencional com os campos na visita | `tool_id` |
| `simulation_complete` | Resultado valido gerado apos acao intencional | `tool_id`, `rate_unit`, `period_unit` |
| `simulation_error` | Validacao impede uma simulacao | `tool_id`, `error_code` com lista controlada |
| `faq_open` | Usuario abre uma pergunta | `tool_id`, `faq_id` estavel |
| `share` | Acao de compartilhamento acionada | `method`, `content_type`, `item_id` |
| `contact_click` | Clique no contato | `contact_method`, sem endereco pessoal |
| `related_tool_click` | Clique em ferramenta relacionada | `tool_id`, `target_tool_id` |

`share` e um evento recomendado do GA4; preferir nomes recomendados quando apropriados. Os demais sao exemplos de eventos personalizados de produto, nao promessas de coleta automatica.

Como as calculadoras podem recalcular a cada digitacao, nao enviar `simulation_complete` em toda renderizacao, nem no resultado inicial com zeros. Definir um ponto de conclusao, como submit explicito; se nao houver submit, definir estabilizacao apos entrada valida com deduplicacao e testar essa regra. Nao mudar a interface apenas para analytics sem decidir o fluxo.

Exemplo conceitual de payload, somente depois de consentimento e inicializacao:

```js
gtag("event", "simulation_complete", {
  tool_id: "juros-compostos",
  rate_unit: "annual",
  period_unit: "months",
});
```

O exemplo nao deve ser colado isoladamente em componentes: implementar uma funcao central que verifica dominio, consentimento e disponibilidade da tag. Falhas de analytics nao podem interromper calculos.

Clique em compartilhar nao prova que uma mensagem foi enviada. Clique em contato nao prova recebimento de e-mail. Nomear indicadores conforme o que realmente foi observado.

### 3.7. Configurar relatorios e validar a coleta

1. Abra `Administrador > Definicoes personalizadas` e registre dimensoes de escopo evento para `tool_id`, `faq_id`, `method`, `rate_unit` e `period_unit`, conforme os relatorios necessarios.
2. Registre parametros antes de depender deles nos dashboards: disponibilizacao nao e instantanea e nao ha garantia de retroatividade nos relatorios.
3. Marque `simulation_complete` como evento principal, se for a principal acao de valor do produto.
4. Use [Tag Assistant](https://tagassistant.google.com/), Tempo real e DebugView para inspecionar a coleta.
5. Abra uma ferramenta, interaja, gere um resultado valido, abra FAQ e compartilhe.
6. Confira que cada acao gera a quantidade definida de eventos, com a pagina correta e sem dados financeiros.
7. Repita recusando consentimento: calculadora deve funcionar, mas coleta opcional deve permanecer bloqueada.
8. Repita em celular e navegue sem recarregar a pagina.
9. Configure exclusao de trafego interno se necessario. Teste filtros antes de ativa-los: exclusoes definitivas podem descartar dados irreversivelmente.
10. Aguarde o processamento dos relatorios, que pode levar 24-48 horas. DebugView/Tempo real sao melhores para testes imediatos.

Bloqueadores, recusa de consentimento e dispositivos diferentes reduzem ou fragmentam a medicao. Usuarios nao equivalem necessariamente a pessoas unicas; contagens Cloudflare e GA4 nao precisam coincidir.

## 4. BI: transformar eventos em um dashboard

### 4.1. Criar o dashboard

Ferramenta: [Google Data Studio](https://datastudio.google.com/), anteriormente Looker Studio. Alguns links e interfaces ainda usam o nome anterior. Referencia: [conector GA4](https://cloud.google.com/looker/docs/studio/connect-to-google-analytics).

1. Acesse com a conta que tem permissao de leitura na propriedade GA4.
2. Selecione `Criar > Fonte de dados > Google Analytics`.
3. Autorize, selecione conta e propriedade `Lemo Finance`, depois conecte.
4. Crie o relatorio e adicione a fonte.
5. Configure seletor de periodo, filtros por ferramenta, dispositivo e canal de aquisicao.
6. Crie a pagina `Visao geral`: usuarios ativos, sessoes, visualizacoes, engajamento e tendencia diaria.
7. Crie `Uso das ferramentas`: usuarios por ferramenta, inicios, conclusoes, erros, FAQ e compartilhamentos.
8. Crie `Aquisicao`: canais, origem/midia, landing pages e desempenho por dispositivo.
9. Restrinja compartilhamento a sua conta ou pessoas autorizadas. Nao publicar dados privados com um link aberto.
10. Compare totais com GA4 usando o mesmo periodo, fuso, filtros e definicao de metrica.

O conector GA4 tem quotas e pode mostrar indisponibilidade com consultas excessivas. Reduza graficos simultaneos e filtros complexos antes de contratar algo.

### 4.2. Indicadores que ajudam a decidir

| Indicador | Definicao e cuidado |
| --- | --- |
| Uso de ferramenta | Usuarios que abriram uma ferramenta, com `tool_id` |
| Conclusoes | Eventos de resultado valido; podem existir varias por usuario |
| Taxa de conclusao por visita | Visitas com conclusao / visitas com inicio, usando o mesmo recorte e deduplicacao |
| Erros | Eventos por `error_code`, nao textos livres de entrada |
| Compartilhamento | Usuarios ou eventos que acionaram compartilhar, nao mensagens enviadas |
| Receita | Valor reportado pelo AdSense, nao quantidade de cliques em botoes do site |

Nao dividir simplesmente contagem de conclusoes por contagem de inicios se uma visita permite varias simulacoes: o resultado pode ultrapassar 100%. Para um funil confiavel, use exploracao de funil GA4 com escopo definido ou dados deduplicados. O conector de BI nao reproduz automaticamente todas as exploracoes do GA4.

Use utm_source, utm_medium e utm_campaign para links externos de divulgacao, com [Campaign URL Builder](https://ga-dev-tools.google/campaign-url-builder/). Nao usar UTM em links internos, pois pode distorcer atribuicao.

### 4.3. Crescimento futuro

Comece com o conector GA4 e nao habilite BigQuery por padrao. Exportacao/consultas podem gerar custos, e seus dados precisam de governanca.

Depois de haver necessidade concreta, considerar BigQuery para historico, funis e uniao de fontes, com orcamentos/alertas e limites de consulta. Heatmaps ou gravacoes de sessao sao opcionais e exigem avaliacao extra de consentimento e mascaramento de campos; nao sao recomendacao inicial para entradas financeiras.

## 5. AdSense: preparacao e ativacao

### 5.1. O que esperar

[Google AdSense](https://adsense.google.com/) vende espacos publicitarios do seu site. Google Ads e o produto para comprar publicidade; nao e o cadastro que voce precisa para monetizar.

Nao ha garantia de aprovacao ou renda. Receita depende de audiencia, regiao, demanda, sazonalidade, visibilidade, consentimento e qualidade do conteudo. A qualificacao geral nao estabelece um numero universal de visitas ou paginas que garanta aprovacao.

Um site pequeno com calculadoras pode concorrer, mas ferramentas incompletas, paginas vazias ou pouco conteudo original podem prejudicar a revisao. Nao criar textos repetitivos apenas para aumentar o numero de paginas.

### 5.2. Checklist antes da inscricao

- [ ] Responsavel com pelo menos 18 anos e acesso ao codigo do site.
- [ ] Paginas uteis e funcionais, sem links quebrados nem anuncios de ferramentas indisponiveis como se existissem.
- [ ] Conteudo original, exemplos e explicacoes proprias sobre as ferramentas.
- [ ] Identificacao/autoria, contato funcionando, politica de privacidade e termos coerentes com a operacao.
- [ ] Simulacoes descritas como educacionais, sem prometer retorno garantido ou aconselhamento individualizado.
- [ ] Navegacao clara e boa experiencia mobile.
- [ ] Consentimento preparado para as regioes atendidas.
- [ ] Sem bloqueio geral, Cloudflare Access ou desafios que impecam crawlers legitimos de acessar o conteudo.
- [ ] Dados reais do titular para verificacao e pagamentos; nao criar contas duplicadas para contornar rejeicao.

Ter paginas legais ou aviso educacional, isoladamente, nao garante conformidade ou aprovacao. Nao publicar texto financeiro de terceiros literalmente.

### 5.3. Cadastro e verificacao

Referencias: [qualificacao](https://support.google.com/adsense/answer/9724?hl=pt-BR) e [adicionar um site](https://support.google.com/adsense/answer/12169212?hl=pt-BR).

1. Entre no AdSense com sua conta Google e confira se ja existe uma conta de publisher vinculada.
2. Informe pais e dados verdadeiros do titular conforme o cadastro.
3. Em `Sites > Novo site`, adicione `lemohr.com.br`, nao `finance-reactjs.pages.dev`.
4. Selecione um metodo de verificacao oferecido: metatag, snippet ou ads.txt.
5. Para a fase de revisao sem anuncios ativos, prefira metatag quando disponivel. Use exatamente o nome e o valor fornecidos, publicados no HTML da pagina.
6. Se optar pelo snippet, integre uma unica vez ao layout compartilhado, seguindo orientacao oficial e consentimento; nao colar em cada componente.
7. Execute `yarn run build`, publique na `main` e aguarde o deploy concluir.
8. Confirme que a verificacao aparece na pagina publicada, nao apenas localmente.
9. Retorne ao AdSense, verifique a propriedade e solicite revisao.
10. Acompanhe `Sites` e a central de politicas. A revisao pode levar dias ou semanas; nao ha prazo garantido.

As regras de AI Crawl Control da Cloudflare nao representam aprovacao do AdSense. Quando o site passar a exibir anuncios, revise a opcao de monetizacao do painel se ela estiver disponivel. Nao bloquear os crawlers de verificacao Google com regras genericas e nao criar liberacoes inseguras apenas pelo user-agent.

### 5.4. Publicar ads.txt

Referencia: [guia oficial de ads.txt](https://support.google.com/adsense/answer/7532444?hl=pt-BR).

1. Copie a linha fornecida pela sua conta AdSense.
2. O projeto ja inclui `public/ads.txt`, usando o publisher fornecido pelo responsavel.
3. A linha publicada deve ser:

```text
google.com, pub-6525518606220983, DIRECT, f08c47fec0942fa0
```

4. Execute o build e publique pelo fluxo normal da `main`.
5. Abra https://lemohr.com.br/ads.txt e confira resposta publica com texto, nao pagina HTML/404.
6. No AdSense, solicite nova verificacao se necessario. O reconhecimento pode demorar.

ads.txt e altamente recomendado, mas nao e sozinho uma aprovacao nem um script que exibe anuncios. `pub-...` e o ID do publisher; o snippet pode usar `ca-pub-...`. Copie cada identificador no formato solicitado.

### 5.5. Consentimento para publicidade

Para anuncios personalizados a visitantes do EEE, Reino Unido e Suica, o Google exige CMP certificada integrada ao TCF, conforme a [politica oficial](https://support.google.com/adsense/answer/13554116?hl=pt-BR).

1. Em `Privacidade e mensagens`, avalie a CMP/mensagem Google ou uma CMP certificada de terceiros.
2. Confira cobertura geografica, categorias e integracao com suas tags. Uma mensagem europeia nao cobre automaticamente todos os requisitos brasileiros ou o GA4.
3. Configure recusa, gerenciamento e revogacao de preferencias.
4. Valide que os scripts respeitam essas escolhas e a estrategia adotada para cada regiao.
5. Nao presumir que anuncios nao personalizados dispensam todos os requisitos de consentimento: ainda podem usar armazenamento ou dados sujeitos a regras.

Evite dois banners independentes e contraditorios. Centralize a gestao das escolhas ou integre explicitamente as ferramentas.

O controle local implementado bloqueia o carregamento do AdSense ate a autorizacao e oferece
recusa e revisao no rodape. Nao e uma CMP certificada pelo Google nem substitui a configuracao
exigida para EEE, Reino Unido e Suica. Antes de veicular nessas regioes, configure e publique
uma mensagem/CMP certificada em `Privacidade e mensagens` e valide a integracao real.
A aprovacao do site, sozinha, nao comprova conformidade de consentimento.

Ao retirar autorizacao depois que o script foi solicitado, a pagina recarrega para interromper
JavaScript de terceiros ja executado; valores das calculadoras sao reiniciados. Mudancas de
consentimento tambem sao sincronizadas entre abas. Cookies de terceiros ja existentes nao
sao removidos automaticamente; o visitante pode limpa-los pelo navegador.

### 5.6. Exibir anuncios sem prejudicar as calculadoras

1. Depois da aprovacao, escolha anuncios automaticos ou unidades manuais. Para este site, recomendo comecar com poucas unidades manuais para controlar posicao.
2. Coloque o script compartilhado uma unica vez e configure as unidades com IDs reais.
3. Comece abaixo do resultado ou entre blocos editoriais; mantenha distancia de inputs, calcular, copiar e compartilhar.
4. Reserve espaco responsivo para reduzir saltos de layout (CLS). Nao esconder nem modificar criativos contra as regras da rede.
5. Exclua paginas sem conteudo suficiente e evite excesso de anuncios sobre a ferramenta.
6. Nao veicular anuncios em localhost, previews ou outros hostnames de teste. Use dominio de producao e preferecias para controlar a ativacao.
7. Valide carregamento inicial e navegacao client-side: nao recriar repetidamente a mesma unidade em um slot nem chamar inicializacao a cada renderizacao.
8. Teste desktop/mobile, com consentimento aceito/recusado e com bloqueador. Ausencia de anuncio nao deve quebrar o layout ou calculadora.
9. Monitore Core Web Vitals antes e depois. Se piorarem, reduza unidades ou mude posicionamento.
10. Nunca clique nos proprios anuncios, peca cliques, compre trafego artificial ou use automacao para gerar impressoes.

GTM, GA4 e AdSense nao sao a mesma coisa. GA4 mede suas interacoes; AdSense reporta impressoes, cliques publicitarios e receita. Nao instrumentar cliques em iframes de anuncios nem tentar identificar o visitante que clicou.

### 5.7. Integracao implementada e pendencias do painel

- `src/config/advertising.ts` concentra `ca-pub-6525518606220983` e o bloco responsivo
  `9529373130`, chamado "Calculadoras — apos o resultado".
- A metatag `google-adsense-account` e herdada do layout por todas as paginas.
- O script compartilhado usa `next/script`, `afterInteractive` e `crossOrigin="anonymous"`.
  So carrega em `https://lemohr.com.br`, apos consentimento. Localhost, Cloudflare previews
  e outros origins nao solicitam anuncios, mesmo com preferencia aceita.
- Cada uma das cinco ferramentas disponiveis tem uma unidade depois dos resultados,
  graficos/tabelas e antes do conteudo explicativo. Home, catalogos, glossario, FAQ
  e paginas institucionais nao possuem blocos manuais.
- A inicializacao espera o script estar pronto e a unidade ter largura positiva; acontece
  uma vez por elemento, inclusive na navegacao client-side. Ha reserva de altura e
  falhas sao registradas sem interromper os calculos.
- A preferencia local fica na chave versionada `lemo-finance:advertising-consent:v1`.
  Recusar ou nao decidir nao solicita o script, nem mesmo anuncios nao personalizados.
  Falhas de armazenamento sao exibidas ao visitante, sem presumir aceite.

Antes de considerar a monetizacao ativa:

1. Publique o projeto e confira metatag e https://lemohr.com.br/ads.txt.
2. Em `Sites`, verifique propriedade e solicite/acompanhe aprovacao.
3. Mantenha **anuncios automaticos desativados** no painel; o site usa posicoes manuais.
   Ativa-los pode inserir publicidade fora das posicoes previstas.
4. Configure consentimento certificado para as regioes em que ele e exigido, conforme 5.5.
5. Confira se o bloco `9529373130` pertence a conta correta e esta disponivel para veiculacao.
6. Valide comportamento, privacidade e layout no site real, sem clicar nos proprios anuncios.

Nao ha garantia de preenchimento de cada unidade: aprovacao pendente, recusa, bloqueadores
ou falta de demanda podem impedir a exibicao. Nao gerar impressoes automatizadas para testar.

### 5.7. Receita, BI e pagamentos

1. No AdSense, acompanhe impressoes, cobertura, visibilidade, receita estimada e RPM de pagina.
2. RPM de pagina corresponde a receita estimada / visualizacoes de pagina x 1.000. Compare periodos e moedas iguais.
3. Exemplo puramente hipotetico: 10.000 visualizacoes e RPM de R$ 5 correspondem a R$ 50. Nao e previsao de receita para este site.
4. Se sua propriedade permitir, vincule AdSense ao GA4 para analisar receita publicitaria junto ao comportamento. Isso nao gera retroatividade garantida.
5. Para o BI, use campos da integracao quando disponiveis ou exporte relatorios do AdSense para uma planilha privada. Nao tratar o conector Google Ads como conector AdSense.
6. Complete verificacoes de identidade/endereco, dados fiscais e forma de pagamento conforme solicitados.
7. Pagamentos dependem de saldo minimo, moeda e ausencia de bloqueios. Consulte o limite mostrado na sua conta; nao presumir pagamento mensal com qualquer saldo.
8. Separe receita estimada de receita finalizada e valores efetivamente recebidos. Consulte apoio contabil para obrigacoes aplicaveis.

## 6. Validacao e rotina sem homologacao ou PR

Nao criar ambiente de homologacao nem obrigatoriedade de PR nesta etapa.

1. Fazer alteracoes localmente, inspecionar desktop/mobile e executar testes focados.
2. Rodar `yarn run lint` e `yarn run build` antes de publicar alteracoes de integracao.
3. Conferir diff: somente mudancas desejadas, sem secrets ou IDs ficticios de producao.
4. Fazer commit/push na `main` e acompanhar o deploy automatico no Pages.
5. Confirmar dominio principal, HTTPS, calculadoras e arquivos publicos afetados.
6. Validar analytics em producao com consentimento e uma sessao controlada, sem cliques em anuncios reais.
7. Se houver regressao, usar rollback para um deployment de producao anterior no Pages e corrigir/reverter o commit no Git. Novos pushes podem substituir o rollback.

IDs de GA4/AdSense e regras de consentimento podem mudar o HTML publicado. Testes devem verificar funcionamento com tags ausentes/bloqueadas e ausencia de coleta indevida.

Rotina semanal: acompanhar erros e conclusoes de simulacao, paginas de entrada, canais, desempenho mobile e mensagens do AdSense. Mensalmente: revisar custos, entregabilidade do e-mail, politica de privacidade e retorno real dos anuncios.

## 7. Checklist de execucao

- [ ] Escolher encaminhamento ou caixa postal com envio pelo dominio.
- [ ] Configurar e testar `contato@lemohr.com.br`.
- [ ] Habilitar Cloudflare Web Analytics e conferir o proximo deploy.
- [ ] Definir politica e preferencias de privacidade antes de tags opcionais.
- [ ] Criar GA4, registrar o ID e implementar coleta condicionada.
- [ ] Instrumentar eventos de produto sem entradas financeiras ou dados pessoais.
- [ ] Validar page views e deduplicacao em DebugView.
- [ ] Criar dashboard privado no Data Studio.
- [ ] Revisar conteudo e requisitos de qualificacao do AdSense.
- [ ] Cadastrar o site, verificar propriedade e publicar ads.txt real.
- [ ] Configurar CMP e solicitar revisao.
- [ ] Depois da aprovacao, ativar poucas unidades e medir impacto.
- [ ] Conferir pagamentos e custo-beneficio periodicamente.

## 8. Referencias complementares

- [Eventos GA4](https://support.google.com/analytics/answer/9322688?hl=pt-BR).
- [Google Consent Mode](https://developers.google.com/tag-platform/security/guides/consent).
- [Cloudflare Web Analytics e privacidade](https://developers.cloudflare.com/web-analytics/about/).
- [Politicas do programa AdSense](https://support.google.com/adsense/answer/48182?hl=pt-BR).
- [Google Search Console](https://search.google.com/search-console/): ferramenta complementar gratuita para indexacao e desempenho de busca; nao mede uso das calculadoras nem e pre-requisito de aprovacao AdSense.

Nota: links externos servem como referencias de configuracao. Este guia nao altera contas, DNS, scripts, preferencias de visitantes ou anuncios do site automaticamente.