import { MailService } from '@sendgrid/mail';
import { MeetingSummary } from './openai';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

export interface EmailAttendee {
  name?: string;
  email: string;
  role?: string;
}

export class EmailService {
  // Send meeting summary to all attendees
  async sendMeetingSummary(
    meetingTitle: string,
    attendees: EmailAttendee[],
    transcription: string,
    summary: MeetingSummary,
    language: string = 'nl'
  ): Promise<boolean> {
    try {
      console.log(`📧 EmailService.sendMeetingSummary called with:`);
      console.log(`  - Title: ${meetingTitle}`);
      console.log(`  - Attendees: ${attendees.length} (${attendees.map(a => a.email).join(', ')})`);
      console.log(`  - Language: ${language}`);
      console.log(`  - Summary keys: ${Object.keys(summary)}`);
      
      const isEnglish = language === 'en';
      
      // Create email content
      const subject = isEnglish 
        ? `Meeting Summary: ${meetingTitle}`
        : `Meeting Samenvatting: ${meetingTitle}`;

      console.log(`📧 Email subject: ${subject}`);

      const htmlContent = this.generateEmailHTML(summary, transcription, isEnglish);
      const textContent = this.generateEmailText(summary, transcription, isEnglish);
      
      console.log(`📧 Email content generated, HTML length: ${htmlContent.length}, text length: ${textContent.length}`);

      // Send to each attendee
      console.log(`📧 Preparing to send emails to ${attendees.length} attendees...`);
      const emailPromises = attendees.map((attendee, index) => {
        console.log(`📧 Sending email ${index + 1}/${attendees.length} to: ${attendee.email}`);
        return mailService.send({
          to: attendee.email,
          from: 'ai-notulist@replit.app', // Use a verified sender domain
          subject: subject,
          text: textContent,
          html: htmlContent,
        });
      });

      console.log(`📧 Executing ${emailPromises.length} email sends...`);
      await Promise.all(emailPromises);
      console.log(`✅ Meeting summary sent to ${attendees.length} attendees`);
      return true;
    } catch (error: any) {
      console.error('❌ SendGrid email error:', error);
      console.error('❌ Error details:', error?.response?.body || error?.message || error);
      return false;
    }
  }

  // Generate HTML email content
  private generateEmailHTML(summary: MeetingSummary, transcription: string, isEnglish: boolean): string {
    const labels = isEnglish ? {
      title: 'Meeting Summary',
      keyPoints: 'Key Discussion Points',
      decisions: 'Decisions Made',
      actionItems: 'Action Items',
      participants: 'Participants',
      duration: 'Duration',
      nextSteps: 'Next Steps',
      fullTranscript: 'Full Transcript',
      task: 'Task',
      assignee: 'Assignee',
      dueDate: 'Due Date'
    } : {
      title: 'Meeting Samenvatting',
      keyPoints: 'Belangrijke Discussiepunten',
      decisions: 'Genomen Beslissingen',
      actionItems: 'Actiepunten',
      participants: 'Deelnemers',
      duration: 'Duur',
      nextSteps: 'Volgende Stappen',
      fullTranscript: 'Volledige Transcriptie',
      task: 'Taak',
      assignee: 'Toegewezen aan',
      dueDate: 'Deadline'
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 25px; }
        ul, ol { margin: 10px 0; padding-left: 25px; }
        li { margin: 5px 0; }
        .action-item { background: #f8f9fa; padding: 10px; margin: 5px 0; border-left: 4px solid #007bff; }
        .info-box { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .transcript { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 14px; }
    </style>
</head>
<body>
    <h1>${labels.title}: ${summary.title}</h1>
    
    <div class="info-box">
        <strong>${labels.participants}:</strong> ${summary.participants.join(', ')}<br>
        <strong>${labels.duration}:</strong> ${summary.duration}
    </div>

    <h2>${labels.keyPoints}</h2>
    <ul>
        ${summary.keyPoints.map(point => `<li>${point}</li>`).join('')}
    </ul>

    <h2>${labels.decisions}</h2>
    <ul>
        ${summary.decisions.map(decision => `<li>${decision}</li>`).join('')}
    </ul>

    <h2>${labels.actionItems}</h2>
    ${summary.actionItems.map(item => `
        <div class="action-item">
            <strong>${labels.task}:</strong> ${item.task}<br>
            ${item.assignee ? `<strong>${labels.assignee}:</strong> ${item.assignee}<br>` : ''}
            ${item.dueDate ? `<strong>${labels.dueDate}:</strong> ${item.dueDate}` : ''}
        </div>
    `).join('')}

    ${summary.nextSteps ? `
        <h2>${labels.nextSteps}</h2>
        <ul>
            ${summary.nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ul>
    ` : ''}

    <div class="transcript">
        <h2>${labels.fullTranscript}</h2>
        <p>${transcription}</p>
    </div>
</body>
</html>`;
  }

  // Generate plain text email content
  private generateEmailText(summary: MeetingSummary, transcription: string, isEnglish: boolean): string {
    const labels = isEnglish ? {
      title: 'MEETING SUMMARY',
      keyPoints: 'KEY DISCUSSION POINTS',
      decisions: 'DECISIONS MADE',
      actionItems: 'ACTION ITEMS',
      participants: 'Participants',
      duration: 'Duration',
      nextSteps: 'NEXT STEPS',
      fullTranscript: 'FULL TRANSCRIPT',
      task: 'Task',
      assignee: 'Assignee',
      dueDate: 'Due Date'
    } : {
      title: 'MEETING SAMENVATTING',
      keyPoints: 'BELANGRIJKE DISCUSSIEPUNTEN',
      decisions: 'GENOMEN BESLISSINGEN',
      actionItems: 'ACTIEPUNTEN',
      participants: 'Deelnemers',
      duration: 'Duur',
      nextSteps: 'VOLGENDE STAPPEN',
      fullTranscript: 'VOLLEDIGE TRANSCRIPTIE',
      task: 'Taak',
      assignee: 'Toegewezen aan',
      dueDate: 'Deadline'
    };

    return `
${labels.title}: ${summary.title}

${labels.participants}: ${summary.participants.join(', ')}
${labels.duration}: ${summary.duration}

${labels.keyPoints}:
${summary.keyPoints.map(point => `• ${point}`).join('\n')}

${labels.decisions}:
${summary.decisions.map(decision => `• ${decision}`).join('\n')}

${labels.actionItems}:
${summary.actionItems.map(item => 
  `• ${labels.task}: ${item.task}${item.assignee ? `\n  ${labels.assignee}: ${item.assignee}` : ''}${item.dueDate ? `\n  ${labels.dueDate}: ${item.dueDate}` : ''}`
).join('\n')}

${summary.nextSteps ? `${labels.nextSteps}:\n${summary.nextSteps.map(step => `• ${step}`).join('\n')}\n` : ''}

${labels.fullTranscript}:
${transcription}
    `.trim();
  }
}

export const emailService = new EmailService();