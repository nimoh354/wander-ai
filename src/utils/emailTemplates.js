// src/utils/emailTemplates.js

export const welcomeEmail = (name, email) => ({
  subject: 'Welcome to WanderAI! 🌍',
  html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f3ff; border-radius: 16px;">
      <div style="text-align: center; padding: 20px 0;">
        <span style="font-size: 48px;">🌍</span>
        <h1 style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #8B5CF6, #EC4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">WanderAI</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
        <h2 style="color: #1a1a2e;">Hi ${name || 'Traveler'}! 👋</h2>
        <p style="color: #4a4a6a; line-height: 1.6;">Welcome to WanderAI! You're now part of a community of travelers who use AI to plan their dream trips.</p>
        <p style="color: #4a4a6a; line-height: 1.6;">Here's what you can do right now:</p>
        <ul style="color: #4a4a6a; line-height: 1.8;">
          <li>✨ Plan a trip with our AI</li>
          <li>💬 Chat with other travelers</li>
          <li>📸 Share photos of your adventures</li>
          <li>⭐ Review trips you've taken</li>
        </ul>
        <a href="https://wanderai.app/dashboard" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px;">Start Planning →</a>
      </div>
      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
        <p>© 2024 WanderAI • Made with ❤️</p>
        <p><a href="https://wanderai.app" style="color: #8B5CF6; text-decoration: none;">Website</a> • <a href="https://wanderai.app/privacy" style="color: #8B5CF6; text-decoration: none;">Privacy</a></p>
      </div>
    </div>
  `
})

export const tripReminderEmail = (destination, date) => ({
  subject: `🗺️ Reminder: Your trip to ${destination} is coming up!`,
  html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f3ff; border-radius: 16px;">
      <div style="text-align: center; padding: 20px 0;">
        <span style="font-size: 48px;">✈️</span>
        <h1 style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #8B5CF6, #EC4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">WanderAI</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
        <h2 style="color: #1a1a2e;">🚀 Your trip to ${destination} is almost here!</h2>
        <p style="color: #4a4a6a; line-height: 1.6;">${date ? `📅 Departure: ${new Date(date).toLocaleDateString()}` : 'Check your itinerary for dates!'}</p>
        <p style="color: #4a4a6a; line-height: 1.6;">Here are some things to check before you go:</p>
        <ul style="color: #4a4a6a; line-height: 1.8;">
          <li>✅ Pack your bags</li>
          <li>✅ Check your passport</li>
          <li>✅ Confirm your bookings</li>
          <li>✅ Share your itinerary with friends</li>
        </ul>
        <a href="https://wanderai.app/dashboard" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px;">View Itinerary →</a>
      </div>
      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
        <p>© 2024 WanderAI • Safe travels! ✈️</p>
      </div>
    </div>
  `
})

export const bookingConfirmationEmail = (destination, bookingDetails) => ({
  subject: `✅ Booking Confirmed: ${destination}`,
  html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f3ff; border-radius: 16px;">
      <div style="text-align: center; padding: 20px 0;">
        <span style="font-size: 48px;">✅</span>
        <h1 style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #8B5CF6, #EC4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Booking Confirmed</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
        <h2 style="color: #1a1a2e;">🎉 Your booking for ${destination} is confirmed!</h2>
        <p style="color: #4a4a6a; line-height: 1.6;">${bookingDetails ? `📋 ${bookingDetails}` : 'Check your dashboard for details.'}</p>
        <a href="https://wanderai.app/dashboard" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px;">View Booking →</a>
      </div>
      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
        <p>© 2024 WanderAI • Have a great trip! 🌟</p>
      </div>
    </div>
  `
})