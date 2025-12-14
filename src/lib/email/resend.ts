/**
 * Resend Email Service
 *
 * Handles sending emails via Resend API.
 * Used for password reset and other transactional emails.
 */

import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Email sender configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@rodriguesagro.com.br'
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Rodrigues AI'

interface SendPasswordResetEmailParams {
  to: string
  resetLink: string
  expirationMinutes?: number
}

/**
 * Send password reset email using Resend
 */
export async function sendPasswordResetEmail({
  to,
  resetLink,
  expirationMinutes = 60
}: SendPasswordResetEmailParams): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to,
      subject: 'Redefinição de Senha - Rodrigues AI',
      html: getPasswordResetEmailHtml(resetLink, expirationMinutes),
      text: getPasswordResetEmailText(resetLink, expirationMinutes)
    })

    if (error) {
      console.error('[Resend] Failed to send email:', error)
      return { success: false, error: error.message }
    }

    console.log('[Resend] Password reset email sent to:', to)
    return { success: true }
  } catch (err) {
    console.error('[Resend] Error sending email:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}

/**
 * Plain text version of the email
 */
function getPasswordResetEmailText(
  resetLink: string,
  expirationMinutes: number
): string {
  return `
Olá,

Você solicitou a redefinição de senha para sua conta Rodrigues AI.

Clique no link abaixo para redefinir sua senha:
${resetLink}

Este link expira em ${expirationMinutes} minutos.

Se você não solicitou esta redefinição, ignore este email.

Atenciosamente,
Equipe Rodrigues AI
  `.trim()
}

/**
 * HTML version of the email (styled)
 */
function getPasswordResetEmailHtml(
  resetLink: string,
  expirationMinutes: number
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2c5f2d; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; }
    .content h2 { color: #2c5f2d; margin-top: 0; }
    .button { display: inline-block; padding: 14px 35px; background-color: #2c5f2d; color: white !important; text-decoration: none; border-radius: 6px; margin: 25px 0; font-weight: bold; }
    .button:hover { background-color: #1e4620; }
    .link-box { background: #f0f0f0; padding: 12px; border-radius: 4px; font-size: 12px; word-break: break-all; color: #666; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center; }
    .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 4px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌾 Rodrigues AI</h1>
    </div>
    <div class="content">
      <h2>Redefinição de Senha</h2>
      <p>Olá,</p>
      <p>Você solicitou a redefinição de senha para sua conta <strong>Rodrigues AI</strong>.</p>
      <p>Clique no botão abaixo para redefinir sua senha:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Redefinir Senha</a>
      </p>
      <p><small>Ou copie e cole este link no seu navegador:</small></p>
      <div class="link-box">${resetLink}</div>
      <div class="warning">
        ⏱️ <strong>Este link expira em ${expirationMinutes} minutos.</strong>
      </div>
      <p>Se você não solicitou esta redefinição, por favor ignore este email.</p>
      <div class="footer">
        <p>Atenciosamente,<br><strong>Equipe Rodrigues AI</strong></p>
        <p style="color: #aaa;">Sistema de Crédito Agrícola com Inteligência Artificial</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}
