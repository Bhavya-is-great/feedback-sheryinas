import { transporter } from "@/config/mailer.config";

function buildSenderAddress() {
  const transactionalDomain = String(process.env.TRANSACTIONAL_DOMAIN || "").trim();

  if (!transactionalDomain) {
    throw new Error("Missing TRANSACTIONAL_DOMAIN environment variable.");
  }

  if (transactionalDomain.includes("@")) {
    return transactionalDomain;
  }

  return `no-reply@${transactionalDomain}`;
}
export async function sendMail({ to, subject, html, text, replyTo }) {
  return transporter.sendMail({
    from: `Kodex Feedback <${buildSenderAddress()}>`,
    to,
    subject,
    html,
    text,
    replyTo,
  });
}
