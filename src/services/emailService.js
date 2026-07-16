// src/services/emailService.js
import { init, send } from '@emailjs/browser'

const SERVICE_ID = 'service_4vy482i'
const TEMPLATE_ID = 'template_qg263kl'
const PUBLIC_KEY = 'nxFTrHd4tNOPbyiCM'

init(PUBLIC_KEY)

export const sendVerificationEmail = async (userEmail, userName, verificationLink) => {
  try {
    console.log('📧 sendVerificationEmail called with:', { userEmail, userName })

    if (!userEmail) {
      console.warn('⚠️ No email provided')
      return { success: false, error: 'No email provided' }
    }

    const cleanEmail = String(userEmail).trim()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      console.warn('⚠️ Invalid email:', cleanEmail)
      return { success: false, error: 'Invalid email address' }
    }

    const templateParams = {
      to_email: cleanEmail,
      name: userName || 'Traveler',
      verification_link: verificationLink || `https://wander-ai-lovat.vercel.app/login?email=${encodeURIComponent(cleanEmail)}`
    }

    console.log('📧 Sending with params:', templateParams)

    const response = await send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams
    )

    console.log('✅ Email sent!', response)
    return { success: true, response }
  } catch (error) {
    console.error('❌ Email error:', error)
    return { success: false, error: error.message }
  }
}