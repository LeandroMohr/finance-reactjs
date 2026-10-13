import type { Metadata } from "next";
import InstitutionalPage, {
  type InstitutionalSection,
} from "@/components/institutionalPage/InstitutionalPage";
import { siteConfig } from "@/config/site";

const canonical = "/politica-de-privacidade/";
const description =
  "Saiba quais dados o Lemo Finance trata, para quais finalidades e como exercer seus direitos de privacidade.";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description,
  alternates: { canonical },
  openGraph: {
    title: `${siteConfig.name} | Política de privacidade`,
    description,
    url: new URL(canonical, siteConfig.url).toString(),
    type: "website",
  },
};

const sections: InstitutionalSection[] = [
  {
    id: "escopo",
    title: "1. Escopo desta política",
    content: (
      <>
        <p>
          Esta política explica como o {siteConfig.name} trata dados pessoais durante o acesso às
          suas páginas, o uso das calculadoras e o contato por e-mail. Ela se aplica ao site
          disponível em <strong>{siteConfig.url}</strong>.
        </p>
        <p>
          O responsável pelo tratamento é {siteConfig.author}, que pode ser contatado pelo endereço
          indicado ao final desta política.
        </p>
      </>
    ),
  },
  {
    id: "dados-tratados",
    title: "2. Dados tratados",
    content: (
      <>
        <p>
          As calculadoras funcionam sem cadastro. Os valores inseridos são processados no próprio
          navegador e não são enviados nem armazenados pelo {siteConfig.name}.
        </p>
        <p>Podemos tratar apenas os dados necessários nas seguintes situações:</p>
        <ul>
          <li>
            <strong>Contato:</strong> nome, endereço de e-mail e informações incluídas
            voluntariamente na mensagem.
          </li>
          <li>
            <strong>Registros técnicos:</strong> endereço IP, data, horário, página acessada e dados
            do navegador que o provedor de hospedagem pode registrar para segurança e operação.
          </li>
          <li>
            <strong>Preferência de tema:</strong> escolha entre tema claro e escuro, salva localmente
            no dispositivo por meio de <code>localStorage</code>.
          </li>
          <li>
            <strong>Preferência de privacidade:</strong> sua escolha conjunta de aceitar ou recusar
            publicidade e análise de uso, salva localmente no navegador. Não é necessário informar
            nome ou e-mail para escolher.
          </li>
          <li>
            <strong>Análise de uso autorizada:</strong> o Google Analytics pode tratar identificadores
            de cookies, dados do navegador e dispositivo, páginas visitadas, origem das visitas e
            informações de navegação para medir audiência e uso do site. Não enviamos os valores
            das simulações ao Analytics.
          </li>
          <li>
            <strong>Interações autorizadas:</strong> registramos início, confirmação e erros de
            simulação por identificador da ferramenta, abertura de perguntas frequentes,
            compartilhamento, cópia de link, clique em contato, acesso a ferramentas relacionadas
            e cliques de navegação nos menus superior e do rodapé.
            Na busca do glossário, registramos apenas a quantidade de caracteres e de resultados,
            sem enviar o texto pesquisado, valores financeiros ou o endereço de e-mail do contato.
          </li>
          <li>
            <strong>Publicidade autorizada:</strong> o Google AdSense e seus parceiros podem tratar
            endereço IP, identificadores de cookies, informações do dispositivo, páginas visitadas
            e interações com anúncios. O site não envia os valores das simulações como eventos
            de publicidade.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "finalidades",
    title: "3. Finalidades e bases legais",
    content: (
      <ul>
        <li>Responder dúvidas e solicitações enviadas pelo usuário.</li>
        <li>Manter o site disponível, estável e protegido contra uso indevido.</li>
        <li>Cumprir obrigações legais e resguardar direitos, quando necessário.</li>
        <li>Preservar a preferência visual escolhida no dispositivo.</li>
        <li>
          Com seu consentimento, carregar publicidade para financiar o site, incluindo sua
          exibição e medição. Personalização depende das preferências e regras aplicáveis.
        </li>
        <li>Com seu consentimento, medir visitas e navegação para entender e melhorar o uso do site.</li>
        <li>Guardar a preferência de privacidade para respeitar sua escolha nas próximas visitas.</li>
      </ul>
    ),
  },
  {
    id: "cookies",
    title: "4. Cookies e armazenamento local",
    content: (
      <>
        <p>
          O tema visual e a preferência de privacidade são guardados em <code>localStorage</code>.
          Essas preferências não são cookies publicitários e permanecem até serem alteradas
          ou até você limpar o armazenamento do navegador.
        </p>
        <p>
          O código do Google AdSense e do Google Analytics só é carregado no domínio de produção
          após você aceitar publicidade e análise de uso em uma única escolha. Sem uma escolha
          ou ao recusar, nenhum desses serviços é carregado e as calculadoras continuam funcionando.
          Uma autorização anterior que abrangia apenas publicidade não autoriza o Analytics:
          nesse caso, solicitamos uma nova escolha para ambos os serviços.
        </p>
        <p>
          Após a autorização, o Google e seus parceiros podem utilizar cookies e armazenamento
          local para análise de uso e publicidade, inclusive anúncios não personalizados. Quando aplicável,
          suas próprias mensagens de consentimento também precisam ser respeitadas.
        </p>
        <p>
          Use <strong>Preferências de privacidade</strong>, no rodapé, para revisar ou retirar
          sua autorização conjunta. Se os scripts já tiverem sido solicitados, a recusa recarrega
          a página para interromper a publicidade e a análise de uso; os valores preenchidos nas calculadoras
          serão reiniciados. Essa alteração também pode recarregar outras abas abertas do site.
        </p>
        <p>
          Retirar a autorização impede novos carregamentos, mas não desfaz tratamentos já
          realizados nem apaga automaticamente cookies de terceiros. Você também pode
          excluí-los nas configurações do navegador.
        </p>
      </>
    ),
  },
  {
    id: "compartilhamento",
    title: "5. Compartilhamento e transferência",
    content: (
      <>
        <p>
          Dados podem ser processados por fornecedores essenciais de hospedagem e infraestrutura,
          somente na medida necessária para operar e proteger o site. Também poderão ser divulgados
          para cumprir obrigação legal, ordem de autoridade competente ou proteger direitos.
        </p>
        <p>
          Alguns fornecedores podem operar infraestrutura em outros países. Nesses casos, buscamos
          serviços com medidas adequadas de segurança e proteção de dados.
        </p>
        <p>
          Quando a publicidade e a análise de uso são autorizadas, dados também podem ser tratados
          pelo Google e seus parceiros, inclusive fora do Brasil, conforme as preferências
          aplicáveis. Consulte{" "}
          <a href="https://policies.google.com/technologies/partner-sites">
            como o Google usa informações de sites parceiros
          </a>{" "}
          e sua <a href="https://policies.google.com/privacy">política de privacidade</a>.
        </p>
      </>
    ),
  },
  {
    id: "retencao-seguranca",
    title: "6. Retenção e segurança",
    content: (
      <>
        <p>
          Mensagens de contato são mantidas pelo tempo necessário para responder à solicitação e
          cumprir obrigações aplicáveis. Registros técnicos seguem os prazos definidos pelo provedor
          de infraestrutura e pela legislação. A retenção dos dados de análise de uso depende
          das configurações da propriedade no Google Analytics. A retenção de dados publicitários
          pelo Google e seus parceiros segue suas respectivas políticas.
        </p>
        <p>
          Adotamos medidas razoáveis para reduzir riscos de acesso não autorizado, perda ou alteração.
          Nenhum ambiente digital, porém, oferece segurança absoluta.
        </p>
      </>
    ),
  },
  {
    id: "direitos",
    title: "7. Seus direitos",
    content: (
      <>
        <p>
          Nos termos da Lei Geral de Proteção de Dados (LGPD), você pode solicitar confirmação de
          tratamento, acesso, correção, anonimização, bloqueio, eliminação, portabilidade e informação
          sobre compartilhamentos, quando aplicáveis.
        </p>
        <p>
          Também é possível revogar consentimento ou se opor a um tratamento. Poderemos pedir dados
          adicionais para confirmar a identidade do solicitante e proteger suas informações.
        </p>
      </>
    ),
  },
  {
    id: "links-alteracoes-contato",
    title: "8. Links, alterações e contato",
    content: (
      <>
        <p>
          Links externos seguem políticas próprias, pelas quais o {siteConfig.name} não é responsável.
          Recomendamos consultar os termos e políticas de cada serviço visitado.
        </p>
        <p>
          Esta política pode ser atualizada para refletir mudanças legais ou operacionais. A versão
          vigente e sua data de atualização permanecerão publicadas nesta página.
        </p>
        <p>
          Para dúvidas ou para exercer seus direitos, escreva para{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <InstitutionalPage
      eyebrow="Privacidade e transparência"
      title="Política de privacidade"
      description="Saiba como funcionam os dados de navegação, as preferências, a análise de uso e a publicidade opcionais."
      updatedAt="12 de outubro de 2026"
      sections={sections}
    />
  );
}