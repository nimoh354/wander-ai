// src/services/emailService.js
// import { init, send } from '@emailjs/browser/es/index.js'
import { init, send } from '@emailjs/browser'

// 🔑 YOUR ACTUAL VALUES
const SERVICE_ID = 'service_4vy482i'
const TEMPLATE_ID = 'template_qg263kl'
const PUBLIC_KEY = 'YcQ-o8R1wq2_7nNEXD'
const TEMPLATE_NEWSLETTER = 'template_ktnpj7y'

// Initialize EmailJS with the public key
init(PUBLIC_KEY)

// ✅ Welcome Email (Sign Up)
export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const templateParams = {
      to_email: userEmail,
      name: userName || 'Traveler',
    }

    const response = await send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    )

    console.log('✅ Welcome email sent!', response)
    return response
  } catch (error) {
    console.error('❌ Email error:', error)
    throw error
  }
}

// ✅ Booking Confirmation Email
export const sendBookingConfirmation = async (userEmail, destination, travelers) => {
  try {
    const templateParams = {
      to_email: userEmail,
      destination: destination || 'your trip',
      travelers: travelers || 1,
      name: 'Traveler',
    }

    const response = await send(
      SERVICE_ID,
      'template_booking_confirmation',
      templateParams,
      PUBLIC_KEY
    )

    console.log('✅ Booking confirmation sent!', response)
    return response
  } catch (error) {
    console.error('❌ Booking email error:', error)
    throw error
  }
}

// ✅ Trip Reminder Email
export const sendTripReminder = async (userEmail, destination) => {
  try {
    const templateParams = {
      to_email: userEmail,
      destination: destination || 'your trip',
      name: 'Traveler',
    }

    const response = await send(
      SERVICE_ID,
      'template_trip_reminder',
      templateParams,
      PUBLIC_KEY
    )

    console.log('✅ Trip reminder sent!', response)
    return response
  } catch (error) {
    console.error('❌ Trip reminder error:', error)
    throw error
  }
}

// ✅ Newsletter/Bulk Email
export const sendBulkEmail = async (userEmail, subject, message, userName) => {
  try {
    const templateParams = {
      to_email: userEmail,
      name: userName || 'Traveler',
      subject: subject || 'WanderAI Update',
      message: message || 'Check out the latest updates!',
    }

    const response = await send(
      SERVICE_ID,
      TEMPLATE_NEWSLETTER,
      templateParams,
      PUBLIC_KEY
    )

    console.log('✅ Newsletter sent to:', userEmail)
    return response
  } catch (error) {
    console.error('❌ Newsletter error:', error)
    throw error
  }
}