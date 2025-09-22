export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px', lineHeight: '1.6' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>Privacyverklaring</h1>
      
      <div style={{ fontSize: '16px', color: '#333' }}>
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>1. Introductie</h2>
          <p style={{ marginBottom: '16px' }}>
            AI Notulist respecteert uw privacy en is transparant over hoe we uw gegevens verzamelen, 
            gebruiken en beschermen. Deze privacyverklaring legt uit hoe we omgaan met uw persoonsgegevens 
            in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG/GDPR).
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>2. Welke gegevens verzamelen we?</h2>
          <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px' }}>Gebruikersgegevens:</h3>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li>E-mailadres (voor identificatie en communicatie)</li>
            <li>Naam (voor- en achternaam uit uw profiel)</li>
            <li>Profielafbeelding URL (indien beschikbaar)</li>
          </ul>
          
          <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px' }}>Meeting gegevens:</h3>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li>Meeting titel en taal</li>
            <li>Attendees informatie (namen en e-mailadressen)</li>
            <li>Audio-opnames van meetings</li>
            <li>Transcripties van gesproken tekst</li>
            <li>AI-gegenereerde samenvattingen</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>3. Waarvoor gebruiken we uw gegevens?</h2>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li><strong>Audio transcriptie:</strong> Uw audio wordt verwerkt door ElevenLabs speech-to-text diensten om automatische transcripties te genereren</li>
            <li><strong>AI samenvattingen:</strong> OpenAI GPT wordt gebruikt om gestructureerde meeting samenvattingen te creëren</li>
            <li><strong>E-mail communicatie:</strong> Meeting notities worden via SendGrid e-mail verstuurd naar attendees</li>
            <li><strong>Account beheer:</strong> Voor authenticatie en toegangsbeheer tot uw meetings</li>
            <li><strong>Service verbetering:</strong> Voor het verbeteren van onze dienstverlening (geanonimiseerd)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>4. Rechtsbasis voor verwerking</h2>
          <p style={{ marginBottom: '16px' }}>
            We verwerken uw gegevens op basis van:
          </p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li><strong>Toestemming:</strong> U geeft expliciete toestemming bij het aanmaken van meetings</li>
            <li><strong>Contractuele noodzaak:</strong> Voor het leveren van onze diensten</li>
            <li><strong>Gerechtvaardigd belang:</strong> Voor service verbetering en technisch onderhoud</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>5. Derde partijen en data processing</h2>
          <p style={{ marginBottom: '16px' }}>We delen uw gegevens met de volgende betrouwbare partners:</p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li><strong>ElevenLabs:</strong> Voor speech-to-text transcriptie (audio processing)</li>
            <li><strong>OpenAI:</strong> Voor AI-gegenereerde meeting samenvattingen</li>
            <li><strong>SendGrid:</strong> Voor het versturen van e-mail notificaties</li>
            <li><strong>Replit:</strong> Voor hosting en authenticatie diensten</li>
          </ul>
          <p style={{ marginBottom: '16px' }}>
            Al deze partners zijn GDPR-compliant en hebben adequata beveiligingsmaatregelen.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>6. Bewaartermijnen</h2>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li><strong>Meeting gegevens:</strong> Automatisch verwijderd na 30 dagen (standaard)</li>
            <li><strong>Audio opnames:</strong> Verwijderd na transcriptie verwerking</li>
            <li><strong>Account gegevens:</strong> Bewaard zolang uw account actief is</li>
            <li><strong>E-mail logs:</strong> Bewaard voor 90 dagen voor troubleshooting</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>7. Uw rechten</h2>
          <p style={{ marginBottom: '16px' }}>Onder de AVG/GDPR heeft u de volgende rechten:</p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li><strong>Inzage:</strong> Recht op een overzicht van uw verwerkte gegevens</li>
            <li><strong>Rectificatie:</strong> Recht op correctie van onjuiste gegevens</li>
            <li><strong>Verwijdering:</strong> Recht op verwijdering van uw gegevens ("recht om vergeten te worden")</li>
            <li><strong>Beperking:</strong> Recht om verwerking te beperken in bepaalde gevallen</li>
            <li><strong>Overdraagbaarheid:</strong> Recht op gegevensoverdracht naar andere diensten</li>
            <li><strong>Bezwaar:</strong> Recht om bezwaar te maken tegen verwerking</li>
            <li><strong>Intrekking toestemming:</strong> Recht om toestemming op elk moment in te trekken</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>8. Beveiliging</h2>
          <p style={{ marginBottom: '16px' }}>
            We implementeren passende technische en organisatorische maatregelen om uw gegevens te beschermen:
          </p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li>HTTPS encryptie voor alle data overdracht</li>
            <li>Veilige database opslag met toegangscontroles</li>
            <li>Regelmatige security audits</li>
            <li>Beperkte toegang tot persoonsgegevens (need-to-know basis)</li>
            <li>Automatische data cleanup procedures</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>9. Contact & Klachten</h2>
          <p style={{ marginBottom: '16px' }}>
            Voor vragen over deze privacyverklaring of het uitoefenen van uw rechten:
          </p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li><strong>E-mail:</strong> privacy@ainotulist.com</li>
            <li><strong>Reactietijd:</strong> Binnen 30 dagen</li>
          </ul>
          <p style={{ marginBottom: '16px' }}>
            U heeft ook het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens (AP) 
            als u vindt dat we niet correct omgaan met uw persoonsgegevens.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>10. Wijzigingen</h2>
          <p style={{ marginBottom: '16px' }}>
            We kunnen deze privacyverklaring bijwerken. Belangrijke wijzigingen communiceren we 
            via e-mail of een melding in de applicatie.
          </p>
          <p style={{ marginBottom: '16px' }}>
            <strong>Laatste update:</strong> 22 september 2025
          </p>
        </section>
      </div>
    </main>
  );
}