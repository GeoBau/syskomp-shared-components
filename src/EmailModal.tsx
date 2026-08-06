/**
 * Shared Email Modal Component
 * Reusable modal for email inquiries (Angebot, CAD-Daten, etc.)
 *
 * CSS Strategy: Pure inline styles - no dependencies on Tailwind or external CSS
 */

import React, { useState, useEffect, useMemo } from 'react';

// Color constants - Syskomp design system
const COLORS = {
  skTurkis: '#17a6b0',
  skButton: '#00b51a',
  skButtonHover: '#009914',
  skPrice: '#17a6b0',
  skCad: '#17a6b0',
  skBlau: '#215674',
  skGrau: '#575d5e',
  // Derived colors
  skTurkisLight: 'rgba(23, 166, 176, 0.1)', // sk-turkis with 10% opacity
  skTurkisBorder: '#17a6b0',
};

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

// ─── LocalStorage Persistence ────────────────────────────────

const EMAIL_STORAGE_KEY = 'syskomp-email-contact';

interface EmailContactData {
  name: string;
  phone: string;
  company: string;
}

const loadEmailContactData = (): Partial<EmailContactData> => {
  try {
    const stored = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {};
};

const saveEmailContactData = (data: EmailContactData) => {
  try {
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
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
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '550px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '15px',
    lineHeight: '1.4',
    color: '#374151',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    marginBottom: '5px',
    color: '#000000',
  },
  subtitle: {
    marginBottom: '4px',
  },
  descriptionContainer: {
    marginBottom: '4px',
  },
  note: {
    backgroundColor: COLORS.skTurkisLight,
    border: `1px solid ${COLORS.skTurkisBorder}`,
    borderRadius: '4px',
    padding: '6px',
    margin: '5px',
  },
  emailHeader: {
    border: '1px solid #d1d5db',
    marginBottom: '8px',
    backgroundColor: '#f9fafb',
    padding: '8px 12px',
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
    padding: '8px 12px',
    borderRadius: '4px',
    marginBottom: '8px',
  },
  contactSectionTitle: {
    marginBottom: '3px',
    marginTop: '3px',
  },
  inputsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    minWidth: '110px',
  },
  input: {
    flex: 1,
    padding: '4px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: 'inherit',
  },
  textarea: {
    width: '100%',
    minHeight: '200px',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '12px',
    marginBottom: '12px',
    resize: 'vertical' as const,
  },
  buttonContainer: {
    display: 'flex',
    gap: '6px',
  },
  button: {
    flex: 1,
    color: 'white',
    padding: '8px 14px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500' as const,
    transition: 'opacity 0.2s',
    fontFamily: 'inherit',
    fontSize: 'inherit',
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
const EmailModal: React.FC<EmailModalProps> = (props) => {
  const {
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
  } = props;
  const savedContact = useMemo(() => loadEmailContactData(), []);
  const [contactName, setContactName] = useState(savedContact.name || '');
  const [contactPhone, setContactPhone] = useState(savedContact.phone || '');
  const [contactCompany, setContactCompany] = useState(savedContact.company || '');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [phoneTemp, setPhoneTemp] = useState('');

  // Persist contact data on change
  useEffect(() => {
    saveEmailContactData({ name: contactName, phone: contactPhone, company: contactCompany });
  }, [contactName, contactPhone, contactCompany]);

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
  const callbackNote = contactPhone.trim() ? ' [hat um Rückruf gebeten]' : '';
  const body = `${bodyWithoutContact}\n\nName: ${contactName}\nTelefon: ${contactPhone}${callbackNote}\nFirma: ${contactCompany}`;

  const handleCopyText = async () => {
    const fullEmailText = `An: ${emailTo}\nBetreff: ${emailSubject}\n\n${body}`;

    // textarea/execCommand fallback — needed when the Clipboard API is
    // unavailable OR rejects (e.g. cross-origin iframe without
    // allow="clipboard-write", as on the syskomp landing page embed).
    const legacyCopy = (): boolean => {
      const textArea = document.createElement('textarea');
      textArea.value = fullEmailText;
      textArea.setAttribute('readonly', '');
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      // iOS Safari ignores select() on textareas without an explicit range
      textArea.setSelectionRange(0, fullEmailText.length);
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      document.body.removeChild(textArea);
      return ok;
    };

    // In a cross-origin iframe (landing page embed) the async Clipboard API
    // is usually blocked, and awaiting its rejected promise consumes the
    // user activation that execCommand('copy') needs afterwards — so run the
    // synchronous legacy path FIRST when embedded.
    const embedded = window.self !== window.top;

    let success = false;
    if (embedded) {
      success = legacyCopy();
    }
    if (!success && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(fullEmailText);
        success = true;
      } catch {
        // blocked (permissions policy / iframe) → legacy path below
      }
    }
    if (!success && !embedded) {
      success = legacyCopy();
    }

    setCopySuccess(success);
    if (success) {
      setTimeout(() => setCopySuccess(false), 2000);
    } else {
      console.error('Copy to clipboard failed');
    }
  };

  const handleOpenEmail = () => {
    const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;

    // Anchor + native .click() instead of window.location.href:
    // iOS/WebKit silently blocks mailto: location changes inside a
    // (cross-origin) iframe, as on the syskomp landing page embed.
    // target="_top" navigates the top-level browsing context — allowed with
    // user activation, and mailto never actually leaves the page. Outside an
    // iframe _top is the window itself, so behavior is unchanged there.
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.target = '_top';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

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
        {(description || (note && note.trim())) && (
          <div style={styles.descriptionContainer}>
            {description && <p>{description}</p>}
            {note && note.trim() && (
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
            <div style={{ ...styles.inputRow, position: 'relative' as const }}>
              <label style={styles.label}>Telefon:</label>
              {contactPhone ? (
                <button
                  type="button"
                  onClick={() => { setPhoneTemp(contactPhone); setShowPhoneDialog(true); }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    border: `1px solid ${COLORS.skTurkis}`,
                    borderRadius: '4px',
                    backgroundColor: COLORS.skTurkisLight,
                    color: COLORS.skBlau,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{contactPhone}</span>
                  <span
                    onClick={(e) => { e.stopPropagation(); setContactPhone(''); }}
                    style={{ marginLeft: '6px', fontWeight: 'bold', color: '#6b7280', cursor: 'pointer' }}
                  >&times;</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setPhoneTemp(''); setShowPhoneDialog(true); }}
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    border: `1px solid ${COLORS.skTurkis}`,
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: COLORS.skTurkis,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    textAlign: 'left' as const,
                  }}
                >
                  Bitte um Rückruf
                </button>
              )}

              {showPhoneDialog && (
                <div style={{
                  position: 'absolute' as const,
                  top: '100%',
                  left: '110px',
                  marginTop: '4px',
                  backgroundColor: 'white',
                  border: `1px solid ${COLORS.skTurkisBorder}`,
                  borderRadius: '6px',
                  padding: '14px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  zIndex: 60,
                  width: '280px',
                }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: '600', fontSize: '13px', color: COLORS.skBlau }}>
                    Telefonischen Rückruf anfordern
                  </p>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#6b7280' }}>
                    Wir rufen nur zu Ihren Geschäftszeiten an.
                  </p>
                  <input
                    type="tel"
                    value={phoneTemp}
                    onChange={(e) => setPhoneTemp(e.target.value.replace(/[^0-9+\-()/\s]/g, ''))}
                    placeholder="Ihre Telefonnummer"
                    autoFocus
                    style={{ ...styles.input, marginBottom: '10px' }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => { setContactPhone(phoneTemp); setShowPhoneDialog(false); }}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        backgroundColor: COLORS.skButton,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '12px',
                      }}
                    >
                      Übernehmen
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPhoneDialog(false)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '12px',
                      }}
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
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
            style={{ ...styles.button, backgroundColor: copySuccess ? '#10b981' : COLORS.skTurkis }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            {copySuccess ? '✓ Text kopiert!' : 'Text kopieren'}
          </button>
          <button
            onClick={handleOpenEmail}
            style={{ ...styles.button, backgroundColor: COLORS.skButton }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = COLORS.skButtonHover}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = COLORS.skButton}
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
