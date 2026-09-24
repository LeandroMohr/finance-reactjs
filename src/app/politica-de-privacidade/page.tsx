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
      </ul>
    ),
  },
  {
    id: "cookies",
    title: "4. Cookies e armazenamento local",
    content: (
      <>
        <p>
          Atualmente, o {siteConfig.name} não utiliza cookies de publicidade ou de análise. A única
          preferência persistida pelo próprio site é o tema visual, por meio do armazenamento local
          do navegador.
        </p>
        <p>
          Caso ferramentas de análise, anúncios ou outros cookies sejam adotados no futuro, esta
          política será atualizada e, quando exigido, será solicitado consentimento antes da coleta.
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
          de infraestrutura e pela legislação.
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
      description="Informações claras sobre os poucos dados necessários para operar este site e atender você."
      updatedAt="23 de setembro de 2026"
      sections={sections}
    />
  );
}