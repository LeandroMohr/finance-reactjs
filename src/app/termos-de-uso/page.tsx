import type { Metadata } from "next";
import InstitutionalPage, {
  type InstitutionalSection,
} from "@/components/institutionalPage/InstitutionalPage";
import { siteConfig } from "@/config/site";

const canonical = "/termos-de-uso/";
const description =
  "Consulte as regras de uso, responsabilidades e limites das calculadoras e conteúdos do Lemo Finance.";

export const metadata: Metadata = {
  title: "Termos de uso",
  description,
  alternates: { canonical },
  openGraph: {
    title: `${siteConfig.name} | Termos de uso`,
    description,
    url: new URL(canonical, siteConfig.url).toString(),
    type: "website",
  },
};

const sections: InstitutionalSection[] = [
  {
    id: "aceitacao",
    title: "1. Aceitação e escopo",
    content: (
      <>
        <p>
          Estes termos regulam o acesso ao {siteConfig.name}, suas calculadoras, ferramentas e
          conteúdos. Ao utilizar o site, você declara que leu e concorda com estas condições.
        </p>
        <p>
          Se você não concordar com algum ponto, deve interromper o uso. Pessoas menores de idade
          devem utilizar o site com acompanhamento de responsável legal.
        </p>
      </>
    ),
  },
  {
    id: "servico",
    title: "2. O serviço",
    content: (
      <>
        <p>
          O {siteConfig.name} oferece gratuitamente ferramentas de simulação e conteúdo educativo
          sobre finanças. O acesso atual não exige cadastro, assinatura ou pagamento.
        </p>
        <p>
          Funcionalidades podem ser corrigidas, atualizadas, substituídas ou descontinuadas para
          preservar a qualidade e a segurança do site.
        </p>
      </>
    ),
  },
  {
    id: "simulacoes",
    title: "3. Simulações e conteúdo financeiro",
    content: (
      <>
        <p>
          Os resultados são estimativas produzidas a partir dos valores informados e das fórmulas
          descritas em cada ferramenta. Arredondamentos, datas, impostos, tarifas e regras de
          instituições financeiras podem gerar resultados diferentes.
        </p>
        <p>
          Nenhum conteúdo constitui recomendação de investimento, crédito, compra, venda ou
          contratação de produto. O site não presta consultoria individualizada e não substitui a
          avaliação de um profissional qualificado.
        </p>
        <p>
          Você é responsável por conferir as premissas, comparar fontes e avaliar riscos antes de
          tomar qualquer decisão financeira.
        </p>
      </>
    ),
  },
  {
    id: "uso-permitido",
    title: "4. Uso permitido",
    content: (
      <>
        <p>Ao usar o site, você concorda em não:</p>
        <ul>
          <li>violar leis, direitos de terceiros ou estes termos;</li>
          <li>tentar acessar áreas, sistemas ou dados sem autorização;</li>
          <li>interferir na disponibilidade, integridade ou segurança do serviço;</li>
          <li>usar automação que sobrecarregue a infraestrutura ou contorne limitações técnicas;</li>
          <li>apresentar conteúdo do site como recomendação profissional emitida em seu nome.</li>
        </ul>
      </>
    ),
  },
  {
    id: "propriedade-intelectual",
    title: "5. Propriedade intelectual",
    content: (
      <>
        <p>
          Textos, interfaces, identidade visual e código próprio são protegidos pela legislação
          aplicável. O uso pessoal das ferramentas não transfere direitos sobre esses materiais.
        </p>
        <p>
          É proibido reproduzir, modificar, vender ou explorar comercialmente partes substanciais do
          site sem autorização, exceto nos limites permitidos por lei ou por licenças expressamente
          indicadas no projeto.
        </p>
      </>
    ),
  },
  {
    id: "disponibilidade",
    title: "6. Disponibilidade e links externos",
    content: (
      <>
        <p>
          Buscamos manter informações corretas e o serviço disponível, mas não garantimos operação
          contínua, ausência de falhas ou atualização imediata de todo conteúdo.
        </p>
        <p>
          Links para sites de terceiros são fornecidos como conveniência. O {siteConfig.name} não
          controla nem assume responsabilidade por conteúdo, disponibilidade ou práticas desses
          serviços.
        </p>
      </>
    ),
  },
  {
    id: "responsabilidade",
    title: "7. Limitação de responsabilidade",
    content: (
      <>
        <p>
          Na extensão permitida pela legislação, o {siteConfig.name} não responde por perdas
          decorrentes de decisões tomadas exclusivamente com base em simulações, indisponibilidade
          temporária, dados incorretos fornecidos pelo usuário ou conteúdo de terceiros.
        </p>
        <p>
          Nada nestes termos afasta direitos ou responsabilidades que não possam ser excluídos pela
          legislação brasileira.
        </p>
      </>
    ),
  },
  {
    id: "privacidade",
    title: "8. Privacidade",
    content: (
      <p>
        O tratamento de dados pessoais é descrito na{" "}
        <a href="/politica-de-privacidade/">Política de privacidade</a>, que integra estes termos.
      </p>
    ),
  },
  {
    id: "alteracoes-contato",
    title: "9. Alterações, legislação e contato",
    content: (
      <>
        <p>
          Estes termos podem ser atualizados para acompanhar mudanças no serviço ou na legislação. A
          versão vigente e a data de atualização ficarão disponíveis nesta página.
        </p>
        <p>
          Aplicam-se as leis da República Federativa do Brasil, respeitados os direitos do consumidor
          e as regras legais de competência.
        </p>
        <p>
          Em caso de dúvida, escreva para{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </>
    ),
  },
];

export default function TermsOfUsePage() {
  return (
    <InstitutionalPage
      eyebrow="Regras claras"
      title="Termos de uso"
      description="Condições para usar as ferramentas e conteúdos do Lemo Finance com consciência sobre seu alcance."
      updatedAt="23 de setembro de 2026"
      sections={sections}
    />
  );
}