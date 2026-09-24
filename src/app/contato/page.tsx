import type { Metadata } from "next";
import InstitutionalPage, {
  type InstitutionalSection,
} from "@/components/institutionalPage/InstitutionalPage";
import { siteConfig } from "@/config/site";

const canonical = "/contato/";
const description =
  "Entre em contato com o Lemo Finance para enviar dúvidas, sugestões, correções ou solicitações de privacidade.";
const emailHref = `mailto:${siteConfig.contactEmail}?subject=Contato%20-%20${encodeURIComponent(siteConfig.name)}`;

export const metadata: Metadata = {
  title: "Contato",
  description,
  alternates: { canonical },
  openGraph: {
    title: `${siteConfig.name} | Contato`,
    description,
    url: new URL(canonical, siteConfig.url).toString(),
    type: "website",
  },
};

const sections: InstitutionalSection[] = [
  {
    id: "fale-conosco",
    title: "Fale com o Lemo Finance",
    content: (
      <>
        <p>
          O canal oficial para dúvidas, sugestões, correções e assuntos relacionados ao site é o
          e-mail.
        </p>
        <p>
          <a href={emailHref}>{siteConfig.contactEmail}</a>
        </p>
        <p>
          Não há atendimento para recomendações personalizadas de investimento, crédito ou escolha de
          produtos financeiros.
        </p>
      </>
    ),
  },
  {
    id: "antes-de-escrever",
    title: "Antes de escrever",
    content: (
      <>
        <p>
          A página de <a href="/faq/">Perguntas frequentes</a> reúne respostas sobre funcionamento,
          privacidade dos valores informados e diferenças entre simulações e resultados de
          instituições financeiras.
        </p>
        <p>
          As explicações de fórmulas e premissas ficam na própria página de cada ferramenta e podem
          resolver dúvidas sobre um cálculo específico.
        </p>
      </>
    ),
  },
  {
    id: "informacoes-uteis",
    title: "Como facilitar o atendimento",
    content: (
      <>
        <p>Ao relatar um problema, inclua quando possível:</p>
        <ul>
          <li>o endereço da página em que o problema ocorreu;</li>
          <li>uma descrição objetiva do resultado esperado e do resultado encontrado;</li>
          <li>o navegador e o tipo de dispositivo utilizados;</li>
          <li>uma captura de tela sem informações pessoais ou financeiras.</li>
        </ul>
      </>
    ),
  },
  {
    id: "seguranca",
    title: "Proteja suas informações",
    content: (
      <>
        <p>
          Nunca envie senhas, números completos de cartão, credenciais bancárias, chaves privadas,
          documentos ou outros dados financeiros sensíveis. Essas informações não são necessárias
          para analisar uma dúvida sobre o site.
        </p>
        <p>
          Para entender como mensagens e outros dados são tratados, consulte a{" "}
          <a href="/politica-de-privacidade/">Política de privacidade</a>.
        </p>
      </>
    ),
  },
  {
    id: "privacidade",
    title: "Solicitações de privacidade",
    content: (
      <p>
        O mesmo endereço pode ser usado para exercer direitos previstos na LGPD. Use o assunto
        “Privacidade” e descreva sua solicitação. Poderemos pedir informações adicionais apenas para
        confirmar sua identidade e proteger seus dados.
      </p>
    ),
  },
];

export default function ContactPage() {
  return (
    <InstitutionalPage
      eyebrow="Canal direto"
      title="Contato"
      description="Um caminho simples para conversar sobre o site, sugerir melhorias ou solicitar correções."
      sections={sections}
    />
  );
}