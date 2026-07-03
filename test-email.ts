import { emailService } from './src/shared/services/email.service'

async function testEmail() {
  console.log('📧 Testing Resend email service...')

  // Remplacez par votre vrai email
  const testEmail = 'votre-email@example.com'

  const result = await emailService.sendOTP({
    to: testEmail,
    code: '123456',
    expiresIn: 10,
  })

  if (result) {
    console.log('✅ Email sent successfully!')
    console.log('📬 Check your inbox:', testEmail)
  } else {
    console.error('❌ Email send failed')
    console.log('⚠️  Note: With Resend test domain, emails are only sent to verified addresses')
  }
}

testEmail().catch(console.error)