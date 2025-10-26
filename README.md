# Syskomp Shared Components

Shared React components used across Syskomp configurator projects.

## Components

### EmailModal

Reusable email inquiry modal with contact form.

**Features:**
- Contact form (Name, Telefon, Firma)
- Email preview with live updates
- Copy text / Email öffnen / Close buttons
- Browser-specific mailto handling

**Usage:**

```typescript
import EmailModal from '../shared/src/EmailModal';

<EmailModal
  title="CAD Anfrage"
  emailTo="cad-data@syskomp-group.com"
  subject="CAD-Daten Anfrage"
  bodyWithoutContact="Email body text..."
  onClose={() => setShowModal(false)}
/>
```

## Installation

This repository is used as a Git submodule in:
- RF-Configuratoren
- KLT-configurator

## Updates

To update the shared components in a project:

```bash
git submodule update --remote
```
