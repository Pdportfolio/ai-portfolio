import "server-only";

import nodemailer from "nodemailer";
import { EMAIL_RATE_LIMIT, EMAIL_RATE_WINDOW_SECONDS, emailRateKey, rateLimit } from "./rate-limit";

const MESSAGE_MAX = 2000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SendVisitorResult =
  | { ok: true }
  | { ok: false; error: "rate_limited" | "invalid" | "unavailable" };

function clean(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function sendVisitorMessage(input: {
  name: string;
  email: string;
  message: string;
  ip: string;
}): Promise<SendVisitorResult> {
  const name = clean(input.name);
  const email = clean(input.email);
  const message = input.message.trim();

  if (!name || !message || !EMAIL_PATTERN.test(email) || message.length > MESSAGE_MAX) {
    return { ok: false, error: "invalid" };
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASSWORD;
  const to = process.env.GMAIL_TO;
  if (!user || !pass || !to) {
    console.error("Gmail is not configured.");
    return { ok: false, error: "unavailable" };
  }

  try {
    const limited = await rateLimit(emailRateKey(input.ip), EMAIL_RATE_LIMIT, EMAIL_RATE_WINDOW_SECONDS);
    if (!limited.ok) {
      return { ok: false, error: "rate_limited" };
    }
  } catch (error) {
    console.error("Email rate limit unavailable.", error);
    return { ok: false, error: "unavailable" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: user,
      to,
      replyTo: `${name} <${email}>`,
      subject: `Portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    console.info(`Portfolio message relayed (${input.ip}).`);
    return { ok: true };
  } catch (error) {
    console.error("Gmail send failed.", error);
    return { ok: false, error: "unavailable" };
  }
}
