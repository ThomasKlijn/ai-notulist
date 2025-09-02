import { MailService } from '@sendgrid/mail';

export async function POST() {
  try {
    console.log('🧪 Testing basic SendGrid connectivity...');
    
    if (!process.env.SENDGRID_API_KEY) {
      return Response.json({ error: 'SendGrid API key not found' }, { status: 500 });
    }

    const mailService = new MailService();
    mailService.setApiKey(process.env.SENDGRID_API_KEY);

    // Try to send a simple test email
    const result = await mailService.send({
      to: 'test@example.com',
      from: 'verified@sendgrid.com', // Use SendGrid's test email
      subject: 'SendGrid Test',
      text: 'This is a test email from SendGrid'
    });

    console.log('SendGrid success:', result);
    return Response.json({ success: true, result });
    
  } catch (error: any) {
    console.error('SendGrid error:', error);
    console.error('Error response:', error.response?.body);
    
    return Response.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      statusCode: error.response?.status,
      body: error.response?.body 
    }, { status: 500 });
  }
}