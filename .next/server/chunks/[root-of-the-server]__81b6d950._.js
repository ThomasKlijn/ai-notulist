module.exports = [
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[project]/lib/emailService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmailService",
    ()=>EmailService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$sendgrid$2f$mail$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@sendgrid/mail/index.js [app-route] (ecmascript)");
;
// Initialize SendGrid with API key
if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not found - email sending will be disabled');
} else {
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$sendgrid$2f$mail$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].setApiKey(process.env.SENDGRID_API_KEY);
}
const VERIFIED_SENDER = process.env.VERIFIED_SENDER_EMAIL || 'noreply@ainotulist.com';
class EmailService {
    static async sendConsentRequest(data) {
        if (!process.env.SENDGRID_API_KEY) {
            console.warn('Email sending disabled - no SendGrid API key');
            return false;
        }
        const consentUrl = `${process.env.REPL_URL || 'http://localhost:5000'}/consent/${data.consentToken}`;
        const msg = {
            to: data.attendeeEmail,
            from: VERIFIED_SENDER,
            subject: `Consent Required: Recording Permission for "${data.meetingTitle}"`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937;">Meeting Recording Consent Required</h2>
          
          <p>Hello ${data.attendeeName || 'there'},</p>
          
          <p>You have been invited to participate in a meeting that will be recorded for transcription and AI summary purposes.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Meeting Details</h3>
            <p><strong>Title:</strong> ${data.meetingTitle}</p>
            <p><strong>Organizer:</strong> ${data.organizerName || 'Meeting organizer'}</p>
            <p><strong>Date:</strong> ${data.meetingDate}</p>
          </div>
          
          <h3 style="color: #1f2937;">Your Consent is Required</h3>
          <p>Before this meeting can be recorded, we need your explicit consent for:</p>
          <ul>
            <li>Audio recording during the meeting</li>
            <li>Automatic transcription via ElevenLabs speech-to-text</li>
            <li>AI-generated meeting summary via OpenAI</li>
            <li>Email delivery of meeting notes to participants</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${consentUrl}" 
               style="background-color: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Review & Give Consent
            </a>
          </div>
          
          <div style="background-color: #fef3c7; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>Important:</strong> Recording cannot begin until all participants provide consent. You can withdraw your consent at any time, which will immediately stop processing and delete your audio data.</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            For more information about how we handle your data, please read our 
            <a href="${process.env.REPL_URL || 'http://localhost:5000'}/privacy" style="color: #3b82f6;">privacy policy</a>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            AI Notulist - Automated Meeting Notes<br>
            This email was sent regarding meeting consent. If you did not expect this email, please contact the meeting organizer.
          </p>
        </div>
      `,
            text: `
Meeting Recording Consent Required

Hello ${data.attendeeName || 'there'},

You have been invited to participate in a meeting that will be recorded for transcription and AI summary purposes.

Meeting Details:
- Title: ${data.meetingTitle}
- Organizer: ${data.organizerName || 'Meeting organizer'}  
- Date: ${data.meetingDate}

Your consent is required for:
- Audio recording during the meeting
- Automatic transcription via ElevenLabs speech-to-text
- AI-generated meeting summary via OpenAI
- Email delivery of meeting notes to participants

Please visit the following link to review and provide your consent:
${consentUrl}

Important: Recording cannot begin until all participants provide consent. You can withdraw your consent at any time.

For more information: ${process.env.REPL_URL || 'http://localhost:5000'}/privacy

AI Notulist - Automated Meeting Notes
      `
        };
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$sendgrid$2f$mail$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].send(msg);
            console.log(`Consent email sent to ${data.attendeeEmail} for meeting ${data.meetingTitle}`);
            return true;
        } catch (error) {
            console.error('Failed to send consent email:', error);
            return false;
        }
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__81b6d950._.js.map