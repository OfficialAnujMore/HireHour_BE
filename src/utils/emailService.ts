import sgMail from '@sendgrid/mail'

interface SendTemplatedEmailParams {
  to: string
  templateId: string
  dynamicTemplateData: Record<string, any>
  from?: string // Optional input, but we'll default it to a valid value
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

export const sendTemplatedEmail = async ({
  to,
  templateId,
  dynamicTemplateData,
}: SendTemplatedEmailParams): Promise<void> => {
  const sender = process.env.DOMAIN || '' // fallback to default sender

  const msg: sgMail.MailDataRequired = {
    to,
    from: sender,
    templateId,
    dynamicTemplateData,
  }

  try {
    await sgMail.send(msg)
    console.log(`✅ Templated email sent to ${to}`)
  } catch (error: any) {
    console.error(
      '❌ Failed to send templated email:',
      error.response?.body || error.message,
    )
    throw new Error('Email sending failed')
  }
}
