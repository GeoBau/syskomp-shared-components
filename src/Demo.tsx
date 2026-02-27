import React, { useState } from 'react';
import EmailModal from './EmailModal';

/**
 * Demo page to showcase EmailModal usage
 * Compare this implementation with calls in other programs
 */
const Demo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>EmailModal Demo</h1>
      <p>Click the button below to see the EmailModal in action:</p>

      {/* Normal host context */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>Host App 1: Normale Schrift (14px Arial)</h3>
        <button
          onClick={() => setShowModal(true)}
          style={{
            backgroundColor: '#1e40af',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Open Email Modal
        </button>
      </div>

      {/* Host context with very different fonts - simulates a different app */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'Georgia, serif', fontSize: '22px', color: 'darkred' }}>
        <h3>Host App 2: Große Serif-Schrift (22px Georgia, dunkelrot)</h3>
        <p>Dieser Bereich simuliert eine andere Anwendung mit komplett anderen Font-Einstellungen.</p>
        <button
          onClick={() => setShowModal2(true)}
          style={{
            backgroundColor: '#8b0000',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '22px',
            fontFamily: 'Georgia, serif',
          }}
        >
          Open Email Modal (aus anderer App)
        </button>
      </div>

      {showModal && (
        <EmailModal
          title="Angebot anfragen"
          subtitle="Fordern Sie jetzt ein unverbindliches Angebot an"
          emailTo="info@syskomp.de"
          subjectTitle="Angebot"
          subjectText="Rollenförderer Artnr: 12345"
          bodyWithoutContact={`Sehr geehrte Damen und Herren,

ich interessiere mich für folgendes Produkt:
- Rollenförderer (Artikel-Nr: 12345)
- Länge: 2000mm
- Breite: 600mm

Bitte senden Sie mir ein Angebot zu.

Mit freundlichen Grüßen`}
          description="Füllen Sie das Formular aus und wir melden uns schnellstmöglich bei Ihnen."
          note="Hinweis: Alle Felder sind optional, helfen uns aber bei der schnelleren Bearbeitung."
          onClose={() => setShowModal(false)}
          onEmailSent={() => {
            console.log('Email sent!');
            setShowModal(false);
          }}
        />
      )}

      {showModal2 && (
        <EmailModal
          title="CAD-Daten anfragen"
          subtitle="Technische Zeichnungen anfordern"
          emailTo="cad@syskomp.de"
          subjectTitle="CAD"
          subjectText="Kettenförderer Artnr: 67890"
          bodyWithoutContact={`Sehr geehrte Damen und Herren,

bitte senden Sie mir die CAD-Daten für:
- Kettenförderer (Artikel-Nr: 67890)
- Format: STEP / DXF

Vielen Dank im Voraus.

Mit freundlichen Grüßen`}
          description="CAD-Daten werden in der Regel innerhalb von 24 Stunden bereitgestellt."
          note="Hinweis: CAD-Daten sind nur für registrierte Kunden verfügbar."
          onClose={() => setShowModal2(false)}
          onEmailSent={() => {
            console.log('CAD email sent!');
            setShowModal2(false);
          }}
        />
      )}

      <div style={{ marginTop: '40px', backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '4px' }}>
        <h2>Usage Example:</h2>
        <pre style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
{`import EmailModal from '@syskomp/shared-components/EmailModal';

// Basic usage
<EmailModal
  title="Angebot anfragen"
  subtitle="Fordern Sie jetzt ein unverbindliches Angebot an"
  emailTo="info@syskomp.de"
  subjectTitle="Angebot"
  subjectText="Rollenförderer Artnr: 12345"
  bodyWithoutContact="Email body text here..."
  description="Optional description text"
  note="Optional note text"
  onClose={() => setShowModal(false)}
  onEmailSent={() => console.log('Email sent!')}
/>`}
        </pre>

        <h3 style={{ marginTop: '20px' }}>Props:</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>title</strong>: Modal title (required)</li>
          <li><strong>subtitle</strong>: Subtitle below title (optional)</li>
          <li><strong>emailTo</strong>: Recipient email (required)</li>
          <li><strong>subjectTitle</strong>: Subject prefix, e.g., "Angebot" (optional, defaults to title)</li>
          <li><strong>subjectText</strong>: Subject text, e.g., "Artnr: 12345" (optional)</li>
          <li><strong>bodyWithoutContact</strong>: Email body without contact info (required)</li>
          <li><strong>description</strong>: Description text at top (optional)</li>
          <li><strong>note</strong>: Note text in highlighted box (optional)</li>
          <li><strong>onClose</strong>: Close callback (required)</li>
          <li><strong>onEmailSent</strong>: Callback after email is sent (optional)</li>
        </ul>

        <h3 style={{ marginTop: '20px' }}>Subject Line Format:</h3>
        <p>The email subject is automatically generated as:</p>
        <code style={{ backgroundColor: '#ffffff', padding: '5px', borderRadius: '4px' }}>
          &lt;subjectTitle&gt; &lt;subjectText&gt; #&lt;inquiryNumber&gt;
        </code>
        <p style={{ marginTop: '10px' }}>Example: "Angebot Rollenförderer Artnr: 12345 #20251029-143052"</p>
      </div>
    </div>
  );
};

export default Demo;
