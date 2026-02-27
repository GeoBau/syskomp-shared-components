import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import QuoteModal from './QuoteModal';
import type { QuoteDisplayItem } from './QuoteModal';

const sampleItems: QuoteDisplayItem[] = [
  { description: 'Rollenförderer SKR-50', quantity: 2, unitPrice: 450.0 },
  { description: 'Kurvenroller SKRK-30', quantity: 1, unitPrice: 320.0 },
  { description: 'Anschlagpuffer', quantity: 4, unitPrice: 12.5 },
];

const defaultProps = {
  items: sampleItems,
  onSubmit: vi.fn().mockResolvedValue({ success: true }),
  onClose: vi.fn(),
};

/** Fill all required fields + optional fields so the form is valid */
const fillForm = async (user: ReturnType<typeof userEvent.setup>, container: HTMLElement) => {
  // Query all inputs by type for reliable selection
  const allInputs = container.querySelectorAll('input');
  // Order in DOM: firstName(text), lastName(text), department(text), company(text), street(text),
  // houseNumber(text), zip(text), city(text), phone(tel), email(email)
  const fieldValues: Record<string, string> = {
    'text-0': 'Max',         // firstName
    'text-1': 'Mustermann',  // lastName
    'text-2': 'Einkauf',     // department
    'text-3': 'Test GmbH',   // company
    'text-4': 'Musterstr',   // street
    'text-5': '42',          // houseNumber
    'text-6': '12345',       // zip
    'text-7': 'Berlin',      // city
  };

  let textIdx = 0;
  for (const input of allInputs) {
    if (input.type === 'text') {
      const val = fieldValues[`text-${textIdx}`];
      if (val) await user.type(input, val);
      textIdx++;
    } else if (input.type === 'tel') {
      await user.type(input, '0301234567');
    } else if (input.type === 'email') {
      await user.type(input, 'max@test.de');
    }
  }

};

const getSubmitButton = () =>
  screen.getByText(/Ihr Angebot/);

describe('QuoteModal', () => {
  it('renders with default title', () => {
    render(<QuoteModal {...defaultProps} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Angebot anfordern');
  });

  it('renders with custom title', () => {
    render(<QuoteModal {...defaultProps} title="Sonderangebot" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Sonderangebot');
  });

  it('displays all items', () => {
    render(<QuoteModal {...defaultProps} />);
    expect(screen.getByText('Rollenförderer SKR-50')).toBeInTheDocument();
    expect(screen.getByText('Kurvenroller SKRK-30')).toBeInTheDocument();
    expect(screen.getByText('Anschlagpuffer')).toBeInTheDocument();
  });

  it('shows item count in section title', () => {
    render(<QuoteModal {...defaultProps} />);
    expect(screen.getByText('Artikel (3)')).toBeInTheDocument();
  });

  it('shows prices and total when showPrices is true (default)', () => {
    render(<QuoteModal {...defaultProps} />);
    expect(screen.getByText('Gesamt (netto):')).toBeInTheDocument();
  });

  it('hides prices when showPrices is false', () => {
    render(<QuoteModal {...defaultProps} showPrices={false} />);
    expect(screen.queryByText('Gesamt (netto):')).not.toBeInTheDocument();
  });

  it('renders all required form fields', () => {
    render(<QuoteModal {...defaultProps} />);
    expect(screen.getByText(/Vorname/)).toBeInTheDocument();
    expect(screen.getByText(/Nachname/)).toBeInTheDocument();
    expect(screen.getByText(/Firma/)).toBeInTheDocument();
    expect(screen.getByText(/Straße/)).toBeInTheDocument();
    expect(screen.getByText(/PLZ/)).toBeInTheDocument();
    expect(screen.getByText(/Stadt/)).toBeInTheDocument();
    expect(screen.getByText(/Land/)).toBeInTheDocument();
    expect(screen.getByText(/E-Mail/)).toBeInTheDocument();
  });

  it('renders optional fields (Abteilung, Telefon)', () => {
    render(<QuoteModal {...defaultProps} />);
    expect(screen.getByText(/Telefon/)).toBeInTheDocument();
    expect(screen.getByText(/Abteilung/)).toBeInTheDocument();
  });

  it('has Herr selected by default in salutation', () => {
    render(<QuoteModal {...defaultProps} />);
    expect(screen.getByDisplayValue('Herr')).toBeInTheDocument();
  });

  it('has DE selected by default for country', () => {
    render(<QuoteModal {...defaultProps} />);
    expect(screen.getByDisplayValue('DE')).toBeInTheDocument();
  });

  it('shows privacy notice text', () => {
    render(<QuoteModal {...defaultProps} />);
    expect(screen.getByText(/Mit dem Absenden erkläre ich mich/)).toBeInTheDocument();
  });

  it('calls onClose when Schließen button is clicked', async () => {
    const onClose = vi.fn();
    render(<QuoteModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByText('Schließen'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<QuoteModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when modal body is clicked', () => {
    const onClose = vi.fn();
    render(<QuoteModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole('heading', { level: 2 }));
    expect(onClose).not.toHaveBeenCalled();
  });

  describe('validation', () => {
    it('prevents submit when required fields are empty', async () => {
      const onSubmit = vi.fn();
      render(<QuoteModal {...defaultProps} onSubmit={onSubmit} />);
      await userEvent.click(getSubmitButton());
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('prevents submit with invalid email format', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const { container } = render(<QuoteModal {...defaultProps} onSubmit={onSubmit} />);

      const allInputs = container.querySelectorAll('input');
      let textIdx = 0;
      const textValues = ['Max', 'Mustermann', 'Test GmbH', 'Musterstr', '42', '12345', 'Berlin', 'Einkauf'];
      for (const input of allInputs) {
        if (input.type === 'text') {
          if (textIdx < textValues.length) await user.type(input, textValues[textIdx]);
          textIdx++;
        } else if (input.type === 'tel') {
          await user.type(input, '0301234567');
        } else if (input.type === 'email') {
          await user.type(input, 'not-valid');
        }
      }
      await user.click(getSubmitButton());
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('submit flow', () => {
    it('shows loading state during submit', async () => {
      const user = userEvent.setup();
      let resolveSubmit!: (value: { success: boolean }) => void;
      const onSubmit = vi.fn().mockReturnValue(
        new Promise((resolve) => { resolveSubmit = resolve; })
      );
      const { container } = render(<QuoteModal {...defaultProps} onSubmit={onSubmit} />);

      await fillForm(user, container);
      await user.click(getSubmitButton());

      expect(screen.getByText('Wird gesendet...')).toBeInTheDocument();

      resolveSubmit({ success: true });
      await waitFor(() => {
        expect(screen.queryByText('Wird gesendet...')).not.toBeInTheDocument();
      });
    });

    it('calls onSubmit with correct contact data', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue({ success: true });
      const { container } = render(<QuoteModal {...defaultProps} onSubmit={onSubmit} />);

      await fillForm(user, container);
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });

      const contact = onSubmit.mock.calls[0][0];
      expect(contact.salutation).toBe('Herr');
      expect(contact.firstName).toBe('Max');
      expect(contact.lastName).toBe('Mustermann');
      expect(contact.company).toBe('Test GmbH');
      expect(contact.street).toBe('Musterstr');
      expect(contact.houseNumber).toBe('42');
      expect(contact.zip).toBe('12345');
      expect(contact.city).toBe('Berlin');
      expect(contact.country).toBe('DE');
      expect(contact.department).toBe('Einkauf');
      expect(contact.phone).toBe('0301234567');
      expect(contact.email).toBe('max@test.de');
    });

    it('shows success message after successful submit', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue({
        success: true,
        message: 'Angebot wurde erstellt!',
      });
      const { container } = render(<QuoteModal {...defaultProps} onSubmit={onSubmit} />);

      await fillForm(user, container);
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(screen.getByText('Angebot wurde erstellt!')).toBeInTheDocument();
      });
    });

    it('hides form after successful submit', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue({ success: true });
      const { container } = render(<QuoteModal {...defaultProps} onSubmit={onSubmit} />);

      await fillForm(user, container);
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(screen.queryByText('Kontaktdaten')).not.toBeInTheDocument();
      });
    });

    it('shows error message on failed submit', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue({
        success: false,
        message: 'Server nicht erreichbar',
      });
      const { container } = render(<QuoteModal {...defaultProps} onSubmit={onSubmit} />);

      await fillForm(user, container);
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(screen.getByText('Server nicht erreichbar')).toBeInTheDocument();
      });
      expect(screen.getByText('Kontaktdaten')).toBeInTheDocument();
    });

    it('shows error message when onSubmit throws', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'));
      const { container } = render(<QuoteModal {...defaultProps} onSubmit={onSubmit} />);

      await fillForm(user, container);
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(screen.getByText('Ein unerwarteter Fehler ist aufgetreten.')).toBeInTheDocument();
      });
    });
  });

  describe('items without prices', () => {
    it('hides total row when no items have prices', () => {
      const items: QuoteDisplayItem[] = [
        { description: 'Sonderanfertigung', quantity: 1 },
      ];
      render(<QuoteModal {...defaultProps} items={items} />);
      expect(screen.queryByText('Gesamt (netto):')).not.toBeInTheDocument();
    });

    it('shows "auf Anfrage" for items without unitPrice', () => {
      const items: QuoteDisplayItem[] = [
        { description: 'Standard', quantity: 1, unitPrice: 100 },
        { description: 'Sonder', quantity: 1 },
      ];
      render(<QuoteModal {...defaultProps} items={items} />);
      expect(screen.getByText('auf Anfrage')).toBeInTheDocument();
      expect(screen.getByText('Gesamt (netto):')).toBeInTheDocument();
    });
  });
});
