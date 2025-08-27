// Email service interface for easy switching between mock and real email services
export interface EmailService {
  sendEmail(to: string, subject: string, html: string): Promise<boolean>
  sendWelcomeEmail(to: string, name: string, password: string): Promise<boolean>
  sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<boolean>
  sendFeeReminderEmail(to: string, studentName: string, amount: number, dueDate: Date): Promise<boolean>
  sendAnnouncementEmail(to: string, title: string, content: string): Promise<boolean>
}

// Mock email service for development
class MockEmailService implements EmailService {
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    console.log('📧 Mock Email Sent:')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Content: ${html}`)
    console.log('---')
    return true
  }

  async sendWelcomeEmail(to: string, name: string, password: string): Promise<boolean> {
    const subject = 'Welcome to দারুল আবরার মডেল কামিল মাদ্রাসা'
    const html = `
      <h2>আসসালামু আলাইকুম ${name}</h2>
      <p>দারুল আবরার মডেল কামিল মাদ্রাসায় আপনাকে স্বাগতম!</p>
      <p>আপনার লগইন তথ্য:</p>
      <ul>
        <li>ইমেইল: ${to}</li>
        <li>পাসওয়ার্ড: ${password}</li>
      </ul>
      <p>দয়া করে লগইন করার পর পাসওয়ার্ড পরিবর্তন করুন।</p>
      <p>ধন্যবাদ</p>
    `
    return this.sendEmail(to, subject, html)
  }

  async sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<boolean> {
    const subject = 'পাসওয়ার্ড রিসেট - দারুল আবরার মডেল কামিল মাদ্রাসা'
    const html = `
      <h2>আসসালামু আলাইকুম ${name}</h2>
      <p>আপনার পাসওয়ার্ড রিসেট করার জন্য নিচের লিংকে ক্লিক করুন:</p>
      <a href="${resetLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">পাসওয়ার্ড রিসেট করুন</a>
      <p>এই লিংকটি ২৪ ঘন্টার জন্য বৈধ।</p>
      <p>ধন্যবাদ</p>
    `
    return this.sendEmail(to, subject, html)
  }

  async sendFeeReminderEmail(to: string, studentName: string, amount: number, dueDate: Date): Promise<boolean> {
    const subject = 'ফি পরিশোধের অনুস্মারক - দারুল আবরার মডেল কামিল মাদ্রাসা'
    const html = `
      <h2>আসসালামু আলাইকুম</h2>
      <p>${studentName} এর ফি পরিশোধের অনুস্মারক:</p>
      <ul>
        <li>পরিমাণ: ${amount} টাকা</li>
        <li>শেষ তারিখ: ${dueDate.toLocaleDateString('bn-BD')}</li>
      </ul>
      <p>দয়া করে নির্ধারিত সময়ের মধ্যে ফি পরিশোধ করুন।</p>
      <p>ধন্যবাদ</p>
    `
    return this.sendEmail(to, subject, html)
  }

  async sendAnnouncementEmail(to: string, title: string, content: string): Promise<boolean> {
    const subject = `ঘোষণা: ${title} - দারুল আবরার মডেল কামিল মাদ্রাসা`
    const html = `
      <h2>${title}</h2>
      <div>${content}</div>
      <br>
      <p>দারুল আবরার মডেল কামিল মাদ্রাসা</p>
    `
    return this.sendEmail(to, subject, html)
  }
}

// SendGrid email service (for future use)
class SendGridEmailService implements EmailService {
  private apiKey: string
  private fromEmail: string
  private fromName: string

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || ''
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@darulabraar.edu.bd'
    this.fromName = process.env.EMAIL_FROM_NAME || 'দারুল আবরার মডেল কামিল মাদ্রাসা'
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      // TODO: Implement SendGrid API call when upgrading
      // This would use @sendgrid/mail package
      console.log('SendGrid email would be sent here')
      return true
    } catch (error) {
      console.error('SendGrid email error:', error)
      return false
    }
  }

  async sendWelcomeEmail(to: string, name: string, password: string): Promise<boolean> {
    const subject = 'Welcome to দারুল আবরার মডেল কামিল মাদ্রাসা'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">আসসালামু আলাইকুম ${name}</h2>
        <p>দারুল আবরার মডেল কামিল মাদ্রাসায় আপনাকে স্বাগতম!</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>আপনার লগইন তথ্য:</h3>
          <p><strong>ইমেইল:</strong> ${to}</p>
          <p><strong>পাসওয়ার্ড:</strong> ${password}</p>
        </div>
        <p style="color: #e74c3c;"><strong>গুরুত্বপূর্ণ:</strong> দয়া করে লগইন করার পর পাসওয়ার্ড পরিবর্তন করুন।</p>
        <p>ধন্যবাদ<br>${this.fromName}</p>
      </div>
    `
    return this.sendEmail(to, subject, html)
  }

  async sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<boolean> {
    const subject = 'পাসওয়ার্ড রিসেট - দারুল আবরার মডেল কামিল মাদ্রাসা'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">আসসালামু আলাইকুম ${name}</h2>
        <p>আপনার পাসওয়ার্ড রিসেট করার জন্য নিচের বাটনে ক্লিক করুন:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">পাসওয়ার্ড রিসেট করুন</a>
        </div>
        <p style="color: #e74c3c;">এই লিংকটি ২৪ ঘন্টার জন্য বৈধ।</p>
        <p>ধন্যবাদ<br>${this.fromName}</p>
      </div>
    `
    return this.sendEmail(to, subject, html)
  }

  async sendFeeReminderEmail(to: string, studentName: string, amount: number, dueDate: Date): Promise<boolean> {
    const subject = 'ফি পরিশোধের অনুস্মারক - দারুল আবরার মডেল কামিল মাদ্রাসা'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">আসসালামু আলাইকুম</h2>
        <p>${studentName} এর ফি পরিশোধের অনুস্মারক:</p>
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">বকেয়া ফি</h3>
          <p><strong>পরিমাণ:</strong> ${amount} টাকা</p>
          <p><strong>শেষ তারিখ:</strong> ${dueDate.toLocaleDateString('bn-BD')}</p>
        </div>
        <p>দয়া করে নির্ধারিত সময়ের মধ্যে ফি পরিশোধ করুন।</p>
        <p>ধন্যবাদ<br>${this.fromName}</p>
      </div>
    `
    return this.sendEmail(to, subject, html)
  }

  async sendAnnouncementEmail(to: string, title: string, content: string): Promise<boolean> {
    const subject = `ঘোষণা: ${title} - দারুল আবরার মডেল কামিল মাদ্রাসা`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #007bff; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">ঘোষণা</h1>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #2c3e50;">${title}</h2>
          <div style="line-height: 1.6;">${content}</div>
        </div>
        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; color: #6c757d;">${this.fromName}</p>
        </div>
      </div>
    `
    return this.sendEmail(to, subject, html)
  }
}

// Mailgun email service (for future use)
class MailgunEmailService implements EmailService {
  private apiKey: string
  private domain: string
  private fromEmail: string
  private fromName: string

  constructor() {
    this.apiKey = process.env.MAILGUN_API_KEY || ''
    this.domain = process.env.MAILGUN_DOMAIN || ''
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@darulabraar.edu.bd'
    this.fromName = process.env.EMAIL_FROM_NAME || 'দারুল আবরার মডেল কামিল মাদ্রাসা'
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      // TODO: Implement Mailgun API call when upgrading
      // This would use mailgun-js package
      console.log('Mailgun email would be sent here')
      return true
    } catch (error) {
      console.error('Mailgun email error:', error)
      return false
    }
  }

  async sendWelcomeEmail(to: string, name: string, password: string): Promise<boolean> {
    // Same implementation as SendGrid
    return this.sendEmail(to, 'Welcome', `Welcome ${name}, your password is ${password}`)
  }

  async sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<boolean> {
    // Same implementation as SendGrid
    return this.sendEmail(to, 'Password Reset', `Reset your password: ${resetLink}`)
  }

  async sendFeeReminderEmail(to: string, studentName: string, amount: number, dueDate: Date): Promise<boolean> {
    // Same implementation as SendGrid
    return this.sendEmail(to, 'Fee Reminder', `Fee due for ${studentName}: ${amount}`)
  }

  async sendAnnouncementEmail(to: string, title: string, content: string): Promise<boolean> {
    // Same implementation as SendGrid
    return this.sendEmail(to, title, content)
  }
}

// Factory function to get the appropriate email service
export function getEmailService(): EmailService {
  const provider = process.env.EMAIL_PROVIDER || 'mock'
  
  switch (provider) {
    case 'sendgrid':
      return new SendGridEmailService()
    case 'mailgun':
      return new MailgunEmailService()
    case 'mock':
    default:
      return new MockEmailService()
  }
}

// Export default instance
export default getEmailService()
