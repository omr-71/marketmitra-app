import * as React from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { TEMPLATES } from "./registry";

export type SendTemplateEmailResult =
  | { sent: true }
  | { sent: false; reason: "recipient_suppressed" };

export interface SendTemplateEmailOptions {
  templateData?: Record<string, any>;
  idempotencyKey?: string;
  replyTo?: string;
}

export async function sendTemplateEmail(
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {},
): Promise<SendTemplateEmailResult> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  const resend = new Resend(apiKey);

  const template = TEMPLATES[templateName];

  if (!template) {
    throw new Error(
      `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(", ")}`,
    );
  }

  const recipient = template.to || to;

  if (!recipient) {
    throw new Error("Recipient is required");
  }

  const templateData = options.templateData ?? {};
  const element = React.createElement(template.component, templateData);

  const html = await render(element);
  const text = await render(element, { plainText: true });

  const subject =
    typeof template.subject === "function"
      ? template.subject(templateData)
      : template.subject;

  const { error } = await resend.emails.send({
    from: "MarketMitra <onboarding@resend.dev>",
    to: [recipient],
    subject,
    html,
    text,
    ...(options.replyTo ? { replyTo: options.replyTo } : {}),
  });

  if (error) {
    throw new Error(error.message);
  }

  return { sent: true };
}