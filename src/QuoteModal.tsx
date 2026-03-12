/**
 * Shared Quote Modal Component (Angebot anfordern)
 * Reusable modal for requesting quotes from multiple configurator apps.
 *
 * CSS Strategy: Pure inline styles - no dependencies on Tailwind or external CSS
 * Font/style independent from host application (same approach as EmailModal)
 */

import React, { useState, useEffect } from 'react';

// Color constants - Syskomp design system
const COLORS = {
  skTurkis: '#17a6b0',
  skButton: '#00b51a',
  skButtonHover: '#009914',
  skBlau: '#215674',
  skGrau: '#575d5e',
  skTurkisLight: 'rgba(23, 166, 176, 0.1)',
  skTurkisBorder: '#17a6b0',
  errorRed: '#dc2626',
  errorBg: '#fef2f2',
  successGreen: '#16a34a',
  successBg: '#f0fdf4',
};

// ─── Public Interfaces ───────────────────────────────────────

export interface QuoteDisplayItem {
  description: string;
  quantity: number;
  unitPrice?: number;
}

export interface QuoteContactData {
  salutation: string;
  firstName: string;
  lastName: string;
  company: string;
  street: string;
  houseNumber: string;
  zip: string;
  city: string;
  country: string;
  department: string;
  phone: string;
  email: string;
  note: string;
}

export interface QuoteModalProps {
  title?: string;
  /** Optional description text shown above the contact form (e.g. configuration summary) */
  description?: string;
  items: QuoteDisplayItem[];
  showPrices?: boolean;
  onSubmit: (contact: QuoteContactData) => Promise<{ success: boolean; message?: string }>;
  onClose: () => void;
}

// ─── Inline Styles ───────────────────────────────────────────

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
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '14px',
    lineHeight: '1.4',
    color: '#374151',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    marginBottom: '12px',
    marginTop: '0',
    color: '#000000',
  },
  sectionBox: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    padding: '6px 12px',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  sectionTitle: {
    margin: '0 0 8px 0',
    fontWeight: '600' as const,
    fontSize: '14px',
    color: COLORS.skBlau,
  },
  row: {
    display: 'flex',
    gap: '8px',
    marginBottom: '6px',
  },
  field: (flex: number) => ({
    flex,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  }),
  label: {
    fontSize: '12px',
    color: '#6b7280',
  },
  labelRequired: {
    fontSize: '12px',
    color: '#6b7280',
  },
  requiredStar: {
    color: COLORS.errorRed,
    marginLeft: '2px',
  },
  input: {
    padding: '5px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  inputError: {
    borderColor: COLORS.errorRed,
    backgroundColor: COLORS.errorBg,
  },
  select: {
    padding: '5px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    width: '100%',
    boxSizing: 'border-box' as const,
    backgroundColor: 'white',
  },
  itemsTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '12px',
  },
  itemRow: {
    borderBottom: '1px solid #e5e7eb',
  },
  itemCell: {
    padding: '4px 6px',
    verticalAlign: 'top' as const,
    whiteSpace: 'pre-line' as const,
  },
  itemCellRight: {
    padding: '4px 6px',
    textAlign: 'right' as const,
    whiteSpace: 'nowrap' as const,
  },
  totalRow: {
    fontWeight: '600' as const,
    borderTop: '2px solid #d1d5db',
  },
  privacyRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '12px',
    fontSize: '13px',
    lineHeight: '1.4',
  },
  checkbox: {
    marginTop: '3px',
    accentColor: COLORS.skTurkis,
  },
  buttonContainer: {
    display: 'flex',
    gap: '8px',
  },
  button: {
    flex: 1,
    color: 'white',
    padding: '9px 14px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500' as const,
    transition: 'opacity 0.2s',
    fontFamily: 'inherit',
    fontSize: 'inherit',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed' as const,
  },
  message: (type: 'success' | 'error') => ({
    padding: '10px 12px',
    borderRadius: '4px',
    marginBottom: '10px',
    backgroundColor: type === 'success' ? COLORS.successBg : COLORS.errorBg,
    border: `1px solid ${type === 'success' ? COLORS.successGreen : COLORS.errorRed}`,
    color: type === 'success' ? COLORS.successGreen : COLORS.errorRed,
    textAlign: 'center' as const,
  }),
};

// ─── Helpers ─────────────────────────────────────────────────

const formatPrice = (price: number): string =>
  price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' EUR';

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ─── LocalStorage Persistence ────────────────────────────────

const STORAGE_KEY = 'syskomp-quote-contact';

const loadContactData = (): Partial<QuoteContactData> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {};
};

const saveContactData = (data: QuoteContactData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
};

// ─── Component ───────────────────────────────────────────────

const QuoteModal: React.FC<QuoteModalProps> = ({
  title = 'Angebot anfordern',
  description,
  items,
  showPrices = true,
  onSubmit,
  onClose,
}) => {
  // Form state — initialize from localStorage if available
  const [form, setForm] = useState<QuoteContactData>(() => {
    const defaults: QuoteContactData = {
      salutation: 'Herr',
      firstName: '',
      lastName: '',
      company: '',
      street: '',
      houseNumber: '',
      zip: '',
      city: '',
      country: 'DE',
      department: '',
      phone: '',
      email: '',
      note: '',
    };
    return { ...defaults, ...loadContactData() };
  });

  // Persist contact data on change
  useEffect(() => {
    saveContactData(form);
  }, [form]);

  const [errors, setErrors] = useState<Partial<Record<keyof QuoteContactData, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const sanitizeField = (field: keyof QuoteContactData, value: string): string => {
    const patterns: Partial<Record<keyof QuoteContactData, RegExp>> = {
      firstName:   /[^a-zA-ZäöüÄÖÜß\s\-]/g,
      lastName:    /[^a-zA-ZäöüÄÖÜß\s\-]/g,
      company:     /[^a-zA-ZäöüÄÖÜß0-9\s&.,\-()]/g,
      street:      /[^a-zA-ZäöüÄÖÜß0-9\s.\-]/g,
      houseNumber: /[^a-zA-Z0-9/]/g,
      zip:         /[^a-zA-Z0-9\-]/g,
      city:        /[^a-zA-ZäöüÄÖÜß\s\-.]/g,
      department:  /[^a-zA-ZäöüÄÖÜß0-9\s\-/.]/g,
      phone:       /[^0-9+\-()/\s]/g,
      note:        /[^a-zA-ZäöüÄÖÜß0-9\s.,\-!?()/]/g,
    };
    const pattern = patterns[field];
    return pattern ? value.replace(pattern, '') : value;
  };

  const updateField = (field: keyof QuoteContactData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: sanitizeField(field, value) }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const validate = (): boolean => {
    const requiredFields: (keyof QuoteContactData)[] = [
      'salutation', 'firstName', 'lastName', 'company',
      'street', 'houseNumber', 'zip', 'city', 'country', 'email',
    ];
    const newErrors: Partial<Record<keyof QuoteContactData, boolean>> = {};

    for (const field of requiredFields) {
      if (!form[field].trim()) {
        newErrors[field] = true;
      }
    }

    if (form.email.trim() && !isValidEmail(form.email)) {
      newErrors.email = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setResult(null);

    try {
      const res = await onSubmit(form);
      if (res.success) {
        setResult({ type: 'success', message: res.message || 'Angebot wurde erfolgreich angefordert.' });
      } else {
        setResult({ type: 'error', message: res.message || 'Fehler beim Senden. Bitte versuchen Sie es erneut.' });
      }
    } catch {
      setResult({ type: 'error', message: 'Ein unerwarteter Fehler ist aufgetreten.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Price calculations
  const itemsWithPrice = items.filter((i) => i.unitPrice != null);
  const totalPrice = itemsWithPrice.reduce((sum, i) => sum + i.quantity * i.unitPrice!, 0);
  const hasAnyPrice = showPrices && itemsWithPrice.length > 0;

  const inputStyle = (field: keyof QuoteContactData) => ({
    ...styles.input,
    ...(errors[field] ? styles.inputError : {}),
  });

  const selectStyle = (field: keyof QuoteContactData) => ({
    ...styles.select,
    ...(errors[field] ? styles.inputError : {}),
  });

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Title */}
        <h2 style={styles.title}>{title}</h2>

        {/* Success / Error message */}
        {result && (
          <div style={styles.message(result.type)}>{result.message}</div>
        )}

        {/* Contact form - only show if not succeeded */}
        {result?.type !== 'success' && (
          <>
            {/* ── Kontaktdaten ── */}
            <div style={styles.sectionBox}>
              <p style={styles.sectionTitle}>Kontaktdaten</p>

              {/* Row 1: Anrede / Vorname / Nachname */}
              <div style={styles.row}>
                <div style={styles.field(0.6)}>
                  <label style={styles.label}>Anrede <span style={styles.requiredStar}>*</span></label>
                  <select
                    value={form.salutation}
                    onChange={(e) => updateField('salutation', e.target.value)}
                    style={selectStyle('salutation')}
                  >
                    <option value="Herr">Herr</option>
                    <option value="Frau">Frau</option>
                  </select>
                </div>
                <div style={styles.field(1)}>
                  <label style={styles.label}>Vorname <span style={styles.requiredStar}>*</span></label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    style={inputStyle('firstName')}
                  />
                </div>
                <div style={styles.field(1)}>
                  <label style={styles.label}>Nachname <span style={styles.requiredStar}>*</span></label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    style={inputStyle('lastName')}
                  />
                </div>
              </div>

              {/* Row 2: Abteilung / Telefon / E-Mail */}
              <div style={styles.row}>
                <div style={styles.field(0.8)}>
                  <label style={styles.label}>Abteilung</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => updateField('department', e.target.value)}
                    style={inputStyle('department')}
                  />
                </div>
                <div style={styles.field(0.8)}>
                  <label style={styles.label}>Telefon</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    style={inputStyle('phone')}
                  />
                </div>
                <div style={styles.field(1.4)}>
                  <label style={styles.label}>E-Mail <span style={styles.requiredStar}>*</span></label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    style={inputStyle('email')}
                  />
                </div>
              </div>

              {/* Row 3: Firma */}
              <div style={styles.row}>
                <div style={styles.field(1)}>
                  <label style={styles.label}>Firma <span style={styles.requiredStar}>*</span></label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    style={inputStyle('company')}
                  />
                </div>
              </div>

              {/* Row 4: Strasse / Hausnummer */}
              <div style={styles.row}>
                <div style={styles.field(3)}>
                  <label style={styles.label}>Straße <span style={styles.requiredStar}>*</span></label>
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => updateField('street', e.target.value)}
                    style={inputStyle('street')}
                  />
                </div>
                <div style={styles.field(1)}>
                  <label style={styles.label}>Nr. <span style={styles.requiredStar}>*</span></label>
                  <input
                    type="text"
                    value={form.houseNumber}
                    onChange={(e) => updateField('houseNumber', e.target.value)}
                    style={inputStyle('houseNumber')}
                  />
                </div>
              </div>

              {/* Row 5: Land / PLZ / Stadt */}
              <div style={{ ...styles.row, marginBottom: 0 }}>
                <div style={styles.field(0.5)}>
                  <label style={styles.label}>Land <span style={styles.requiredStar}>*</span></label>
                  <select
                    value={form.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    style={selectStyle('country')}
                  >
                    <option value="DE">DE</option>
                    <option value="AT">AT</option>
                    <option value="CH">CH</option>
                    <option value="NL">NL</option>
                    <option value="BE">BE</option>
                    <option value="FR">FR</option>
                    <option value="PL">PL</option>
                    <option value="CZ">CZ</option>
                    <option value="DK">DK</option>
                    <option value="LU">LU</option>
                  </select>
                </div>
                <div style={styles.field(0.7)}>
                  <label style={styles.label}>PLZ <span style={styles.requiredStar}>*</span></label>
                  <input
                    type="text"
                    value={form.zip}
                    onChange={(e) => updateField('zip', e.target.value)}
                    style={inputStyle('zip')}
                  />
                </div>
                <div style={styles.field(1.5)}>
                  <label style={styles.label}>Stadt <span style={styles.requiredStar}>*</span></label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    style={inputStyle('city')}
                  />
                </div>
              </div>
            </div>

            {/* ── Hinweis für Syskomp ── */}
            <div style={styles.sectionBox}>
              <p style={{ ...styles.sectionTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span>Hinweis für Syskomp</span>
                <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#9ca3af' }}>{form.note.length}/500</span>
              </p>
              <textarea
                value={form.note}
                onChange={(e) => updateField('note', e.target.value.slice(0, 500))}
                maxLength={500}
                rows={3}
                placeholder="Optionaler Hinweis oder Anmerkung..."
                style={{
                  ...styles.input,
                  resize: 'vertical' as const,
                  minHeight: '60px',
                }}
              />
            </div>

            {/* ── Privacy notice ── */}
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', lineHeight: '1.4' }}>
              Mit dem Absenden erkläre ich mich mit der Verarbeitung meiner Daten zur Bearbeitung
              meiner Anfrage einverstanden. Die Daten werden nicht an Dritte weitergegeben.
            </p>

            {/* ── Buttons ── */}
            <div style={styles.buttonContainer}>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  ...styles.button,
                  backgroundColor: COLORS.skButton,
                  ...(submitting ? styles.buttonDisabled : {}),
                }}
                onMouseOver={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = COLORS.skButtonHover; }}
                onMouseOut={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = COLORS.skButton; }}
              >
                {submitting ? 'Wird gesendet...' : (
                  <>Ihr Angebot<br /><span style={{ fontSize: '11px', fontWeight: 'normal' }}>bekommen Sie in Minuten</span></>
                )}
              </button>
              <button
                onClick={onClose}
                style={{ ...styles.button, flex: '0 0 auto', backgroundColor: '#6b7280' }}
                onMouseOver={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Schließen
              </button>
            </div>

            {/* ── Produktbeschreibung (optional) ── */}
            {description && (
              <div style={{
                ...styles.sectionBox,
                whiteSpace: 'pre-line' as const,
                fontSize: '12px',
                lineHeight: '1.5',
                maxHeight: '200px',
                overflowY: 'auto' as const,
              }}>
                {description}
              </div>
            )}

            {/* ── Artikelliste ── */}
            <div style={styles.sectionBox}>
              <p style={styles.sectionTitle}>Artikel ({items.length})</p>
              <table style={styles.itemsTable}>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} style={styles.itemRow}>
                      <td style={styles.itemCell}>{item.description}</td>
                      <td style={styles.itemCellRight}>{item.quantity}x</td>
                      {hasAnyPrice && (
                        <td style={styles.itemCellRight}>
                          {item.unitPrice != null ? formatPrice(item.unitPrice) : 'auf Anfrage'}
                        </td>
                      )}
                    </tr>
                  ))}
                  {hasAnyPrice && (
                    <tr style={styles.totalRow}>
                      <td style={{ ...styles.itemCell, paddingTop: '6px' }}>Gesamt (netto):</td>
                      <td />
                      <td style={{ ...styles.itemCellRight, paddingTop: '6px' }}>{formatPrice(totalPrice)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* After success – only show close button */}
        {result?.type === 'success' && (
          <div style={{ textAlign: 'center' as const }}>
            <button
              onClick={onClose}
              style={{ ...styles.button, backgroundColor: COLORS.skTurkis, maxWidth: '200px' }}
              onMouseOver={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              Schließen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteModal;
