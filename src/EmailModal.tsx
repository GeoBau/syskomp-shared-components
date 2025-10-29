/**
 * Shared Email Modal Component
 * Reusable modal for email inquiries (Angebot, CAD-Daten, etc.)
 *
 * CSS Strategy: Pure inline styles - no dependencies on Tailwind or external CSS
 */

import React, { useState, useMemo } from 'react';

/**
 * Generate inquiry number from timestamp
 * Format: YYYYMMDD-HHMMSS (e.g., 20251026-143052)
 */
const generateInquiryNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
};

interface EmailModalProps {
  /** Modal title */
  title: string;

  /** Subtitle text below title (optional) */
  subtitle?: string;

  /** Email recipient */
  emailTo: string;

  /**
   * Email subject (legacy - use subjectTitle + subjectText for new format)
   * If subjectTitle and subjectText are provided, this will be ignored
   */
  subject?: string;

  /**
   * Subject title (e.g., "CAD", "Angebot")
   * Used with subjectText to build: <title> <text> #<quotenr>
   * If not provided, uses the modal title (per anfrage.md: "title ist Title von anfrage komponente")
   */
  subjectTitle?: string;

  /**
   * Subject text from module (e.g., "Artnr: 12345", "Rollenförderer")
   * Used with subjectTitle to build: <title> <text> #<quotenr>
   */
  subjectText?: string;

  /** Base email body (without contact info) */
  bodyWithoutContact: string;

  /** Additional description text shown at top of modal (optional) */
  description?: string;

  /** Additional note text shown at top of modal (optional) */
  note?: string;

  /** Close modal callback */
  onClose: () => void;

  /** Callback after email is sent (optional) */
  onEmailSent?: () => void;
}

// Inline styles - no Tailwind dependency
const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2px',
    fontSize: '13px',
    color: '#374151',
  },
  modal: {
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    marginBottom: '5px',
    color: '#1e40af',
  },
  subtitle: {
    marginBottom: '4px',
  },
  descriptionContainer: {
    marginBottom: '4px',
  },
  note: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '4px',
    padding: '6px',
    margin: '5px',
  },
  emailHeader: {
    border: '1px solid #d1d5db',
    marginBottom: '4px',
    backgroundColor: '#f9fafb',
    padding: '4px',
    borderRadius: '4px',
  },
  emailHeaderText: {
    marginBottom: '1px',
    marginTop: '1px'
  },
  bold: {
  },
  contactSection: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    padding: '4px',
    borderRadius: '4px',
    marginBottom: '4px',
  },
  contactSectionTitle: {
    marginBottom: '3px',
    marginTop: '3px',
  },
  inputsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  label: {
    minWidth: '110px',
  },
  input: {
    flex: 1,
    padding: '2px 3px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
  },
  textarea: {
    width: '100%',
    minHeight: '200px',
    padding: '5px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '10px',
    marginBottom: '10px',
    resize: 'vertical' as const,
  },
  buttonContainer: {
    display: 'flex',
    gap: '6px',
  },
  button: {
    flex: 1,
    color: 'white',
    padding: '6px 12px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500' as const,
    transition: 'opacity 0.2s',
  },
  buttonClose: {
    flex: '0 0 auto',
    padding: '6px 10px',
  },
};

/**
 * Reusable Email Modal - used by AnfrageButton and CAD-Daten
 *
 * Features:
 * - Contact form (Name, Telefon, Firma)
 * - Email preview with live updates
 * - Copy text / Email öffnen / Close buttons
 * - Browser-specific mailto handling
 * - Automatic inquiry number generation (format: #YYYYMMDD-HHMMSS)
 * - Pure inline styles (no Tailwind dependency)
 */
const EmailModal: React.FC<EmailModalProps> = ({
  title,
  subtitle,
  emailTo,
  subject,
  subjectTitle,
  subjectText,
  bodyWithoutContact,
  description,
  note,
  onClose,
  onEmailSent
}) => {
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate inquiry number once when component mounts
  const inquiryNumber = useMemo(() => generateInquiryNumber(), []);

  // Build subject line: <title> <text> #<quotenr>
  // Per anfrage.md line 5: "title ist Title von anfrage komponente"
  // If subjectTitle is not provided, use the modal title
  // If new props (subjectTitle/subjectText) are provided, use them
  // Otherwise, fall back to legacy subject prop
  const emailSubject = useMemo(() => {
    if (subjectText) {
      const titleForSubject = subjectTitle || title; // Use modal title if subjectTitle not provided
      return `${titleForSubject} ${subjectText} #${inquiryNumber}`;
    }
    return subject || '';
  }, [subjectTitle, subjectText, title, subject, inquiryNumber]);

  // Add contact info to email body
  const body = `${bodyWithoutContact}\n\nName: ${contactName}\nTelefon: ${contactPhone}\nFirma: ${contactCompany}`;

  const handleCopyText = async () => {
    const fullEmailText = `An: ${emailTo}\nBetreff: ${emailSubject}\n\n${body}`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullEmailText);
        setCopySuccess(true);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = fullEmailText;
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(success);
      }

      if (copySuccess) {
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
    }
  };

  const handleOpenEmail = () => {
    const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;

    // Browser-specific mailto handling
    const isChrome = /Chrome/i.test(navigator.userAgent) && !/Edg/i.test(navigator.userAgent);

    if (isChrome) {
      const link = document.createElement('a');
      link.href = mailtoLink;
      link.target = '_blank';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
      document.body.removeChild(link);
    } else {
      window.location.href = mailtoLink;
    }

    onEmailSent?.();
  };

  return (
    <div
      style={styles.overlay}
      onClick={onClose}
    >
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 style={styles.title}>
          {title}
        </h2>

        {/* Subtitle (optional) */}
        {subtitle && (
          <p style={styles.subtitle}>{subtitle}</p>
        )}

        {/* Description & Note (optional) */}
        {(description || note) && (
          <div style={styles.descriptionContainer}>
            {description && <p>{description}</p>}
            {note && (
              <p style={styles.note}>
                {note}
              </p>
            )}
          </div>
        )}

        {/* Email header info */}
        <div style={styles.emailHeader}>
          <p style={styles.emailHeaderText}>
            <span style={styles.bold}>An:</span> {emailTo}
          </p>
          <p style={styles.emailHeaderText}>
            <span style={styles.bold}>Betreff:</span> {emailSubject}
          </p>
        </div>

        {/* Contact Info Inputs */}
        <div style={styles.contactSection}>
          <p style={styles.contactSectionTitle}>
            Mit Ihren Informationen können wir Sie einfacher kontaktieren:
          </p>
          <div style={styles.inputsContainer}>
            <div style={styles.inputRow}>
              <label style={styles.label}>Name:</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="(optional)"
                style={styles.input}
              />
            </div>
            <div style={styles.inputRow}>
              <label style={styles.label}>Telefonnummer:</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(optional)"
                style={styles.input}
              />
            </div>
            <div style={styles.inputRow}>
              <label style={styles.label}>Firma:</label>
              <input
                type="text"
                value={contactCompany}
                onChange={(e) => setContactCompany(e.target.value)}
                placeholder="(optional)"
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Email content textarea */}
        <textarea
          readOnly
          value={body}
          style={styles.textarea}
        />

        {/* Buttons */}
        <div style={styles.buttonContainer}>
          <button
            onClick={handleCopyText}
            style={{ ...styles.button, backgroundColor: copySuccess ? '#10b981' : '#1e40af' }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            {copySuccess ? '✓ Text kopiert!' : 'Text kopieren'}
          </button>
          <button
            onClick={handleOpenEmail}
            style={{ ...styles.button, backgroundColor: 'rgb(31, 160, 160)' }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            E-Mail öffnen
          </button>
          <button
            onClick={onClose}
            style={{ ...styles.button, ...styles.buttonClose, backgroundColor: '#6b7280' }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
