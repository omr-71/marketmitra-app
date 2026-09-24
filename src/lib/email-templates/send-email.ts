import * as React from "react";
import { render } from "@react-email/render";
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
  const apiKey = process.env["BREVO_API_KEY"];
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

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

  let response: Response;
  try {
    response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: "hello.marketmitra@gmail.com",
          name: "MarketMitra",
        },
        to: [{ email: recipient }],
        subject,
        htmlContent: html,
        textContent: text,
        ...(options.replyTo
          ? { replyTo: { email: options.replyTo } }
          : {}),
      }),
    });
  } catch {
    throw new Error("Unable to reach the Brevo email service.");
  }

  if (!response.ok) {
    throw new Error(
      `Brevo rejected the email request (HTTP ${response.status}).`,
    );
  }

  return { sent: true };
}