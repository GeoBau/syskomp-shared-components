/**
 * Shared Email Modal Component
 * Reusable modal for email inquiries (Angebot, CAD-Daten, etc.)
 */

import React, { useState } from 'react';

interface EmailModalProps {
  /** Modal title */
  title: string;

  /** Subtitle text below title (optional) */
  subtitle?: string;

  /** Email recipient */
  emailTo: string;

  /** Email subject */
  subject: string;

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

/**
 * Reusable Email Modal - used by AnfrageButton and CAD-Daten
 *
 * Features:
 * - Contact form (Name, Telefon, Firma)
 * - Email preview with live updates
 * - Copy text / Email öffnen / Close buttons
 * - Browser-specific mailto handling
 */
const EmailModal: React.FC<EmailModalProps> = ({
  title,
  subtitle,
  emailTo,
  subject,
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

  // Add contact info to email body
  const body = `${bodyWithoutContact}\n\nName: ${contactName}\nTelefon: ${contactPhone}\nFirma: ${contactCompany}`;

  const handleCopyText = async () => {
    const fullEmailText = `An: ${emailTo}\nBetreff: ${subject}\n\n${body}`;

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
    const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

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
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-4" style={{ color: '#1e40af' }}>
          {title}
        </h2>

        {/* Subtitle (optional) */}
        {subtitle && (
          <p className="text-center text-gray-600 text-sm mb-4">{subtitle}</p>
        )}

        {/* Description & Note (optional) */}
        {(description || note) && (
          <div className="text-gray-700 mb-4 space-y-3">
            {description && <p>{description}</p>}
            {note && (
              <p className="text-sm bg-blue-50 border border-blue-200 rounded p-3">
                {note}
              </p>
            )}
          </div>
        )}

        {/* Email header info */}
        <div className="mb-2 bg-gray-50 p-2 rounded">
          <p className="text-sm mb-0.5">
            <span className="font-bold">An:</span> {emailTo}
          </p>
          <p className="text-sm">
            <span className="font-bold">Betreff:</span> {subject}
          </p>
        </div>

        {/* Contact Info Inputs */}
        <div className="bg-gray-50 border border-gray-200 p-2 rounded mb-2">
          <p className="text-sm text-gray-700 font-medium mb-1.5">
            Mit Ihren Informationen können wir Sie einfacher kontaktieren:
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <label className="text-sm text-gray-600 min-w-[110px]">Name:</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="(optional)"
                className="flex-1 px-1.5 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-sm text-gray-600 min-w-[110px]">Telefonnummer:</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(optional)"
                className="flex-1 px-1.5 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-sm text-gray-600 min-w-[110px]">Firma:</label>
              <input
                type="text"
                value={contactCompany}
                onChange={(e) => setContactCompany(e.target.value)}
                placeholder="(optional)"
                className="flex-1 px-1.5 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        {/* Email content textarea */}
        <textarea
          readOnly
          value={body}
          className="w-full min-h-[300px] p-2.5 border border-gray-300 rounded font-mono text-xs mb-5 resize-y"
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopyText}
            className="flex-1 text-white px-6 py-3 rounded hover:opacity-90 transition-colors font-medium"
            style={{ backgroundColor: '#1e40af' }}
          >
            {copySuccess ? '✓ Text kopiert!' : 'Text kopieren'}
          </button>
          <button
            onClick={handleOpenEmail}
            className="flex-1 text-white px-6 py-3 rounded hover:opacity-90 transition-colors font-medium"
            style={{ backgroundColor: '#7c3aed' }}
          >
            E-Mail öffnen
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 text-white rounded hover:opacity-90 transition-colors font-medium"
            style={{ backgroundColor: '#6b7280' }}
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
