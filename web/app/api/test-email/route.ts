import { emailService } from '../../../server/emailService';

export async function POST() {
  try {
    console.log('🧪 Testing direct email sending...');
    console.log('SendGrid API Key exists:', !!process.env.SENDGRID_API_KEY);
    console.log('SendGrid API Key starts with:', process.env.SENDGRID_API_KEY?.substring(0, 10));
    
    const result = await emailService.sendMeetingSummary(
      "Test Email",
      [{ email: "test@example.com", name: "Test User" }],
      "Dit is een test transcriptie.",
      {
        title: "Test Meeting",
        keyPoints: ["Test punt 1", "Test punt 2"],
        decisions: ["Test beslissing"],
        actionItems: [],
        participants: ["Test User"],
        duration: "5 minuten",
        nextSteps: []
      },
      "nl"
    );

    console.log(`Email test result: ${result}`);
    
    return Response.json({ 
      success: result, 
      message: result ? 'Email sent successfully' : 'Email failed to send',
      apiKeyExists: !!process.env.SENDGRID_API_KEY 
    });
  } catch (error: any) {
    console.error('Email test error:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}