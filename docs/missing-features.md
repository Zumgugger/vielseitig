# Vielseitig – Missing Features (Priority List)

*Assessment Date: February 3, 2026*

---

## Overview

These are features not yet implemented that would significantly enhance the product's value proposition and user experience.

---

## Priority List

| Priority | Feature | Business Value | Implementation Complexity |
|----------|---------|----------------|--------------------------|
| **1** | **Email Notifications** | High - notify teachers when approved | Medium |
| **2** | **Password Reset Flow** | High - reduce admin burden | Medium |
| **3** | **Bulk Import/Export** | High - teachers can upload adjective CSVs | Low |
| **4** | **Class/Group Management** | High - teachers can create classes, track usage | Medium |
| **5** | **Student Results History** | Medium - teachers see anonymized class patterns | Medium |
| **6** | **Offline Mode (PWA)** | Medium - Chromebooks sometimes offline | Medium |
| **7** | **Multi-language Support** | Medium - expand to French/Italian regions | High |
| **8** | **Print-Friendly View** | Medium - teachers want posters | Low |
| **9** | **License Code System** | High for monetization - self-serve activation | Medium |
| **10** | **Stripe Payment Integration** | High for monetization - automated billing | High |

---

## Detailed Feature Descriptions

### 1. Email Notifications (High Priority)
**Why needed:** Teachers register and wait with no feedback. Admin must manually notify them.

**Scope:**
- Email when registration is received (confirmation)
- Email when account is approved/rejected
- Optional: Weekly digest for admin (new registrations)

**Technical approach:**
- Integrate SendGrid, Mailgun, or AWS SES
- Add email templates (HTML + plain text)
- Environment variables for SMTP config
- Queue emails for reliability

**Effort:** 6-10 hours

---

### 2. Password Reset Flow (High Priority)
**Why needed:** Currently only admin can reset passwords. Creates bottleneck and poor UX.

**Scope:**
- "Passwort vergessen?" link on login page
- Email with secure reset token (24h expiry)
- Reset password form
- Confirmation email after reset

**Technical approach:**
- New endpoint: POST `/api/auth/forgot-password`
- New endpoint: POST `/api/auth/reset-password`
- Password reset tokens table or JWT-based tokens
- Email integration required (see #1)

**Effort:** 4-6 hours (after email is implemented)

---

### 3. Bulk Import/Export (High Priority)
**Why needed:** Teachers with existing adjective lists want to import them quickly.

**Scope:**
- CSV import for adjectives (word, explanation, example)
- CSV export of any list
- Validation with error reporting
- Preview before import

**Technical approach:**
- POST `/api/user/lists/{listId}/import` (multipart/form-data)
- GET `/api/user/lists/{listId}/export` (returns CSV)
- Frontend file upload component
- Papa Parse or similar for CSV parsing

**Effort:** 4-6 hours

---

### 4. Class/Group Management (High Priority)
**Why needed:** Teachers want to organize students by class and track which classes used which lists.

**Scope:**
- Create/edit/delete classes (e.g., "Klasse 8a")
- Assign share links to classes
- View usage statistics per class
- Optional: Class codes for students to join

**Technical approach:**
- New model: `classes` (id, name, teacher_id, created_at)
- Link sessions to classes via share token
- Aggregate analytics per class
- New UI section in teacher dashboard

**Effort:** 12-16 hours

---

### 5. Student Results History (Medium Priority)
**Why needed:** Teachers want to see patterns across a class (which adjectives are most chosen).

**Scope:**
- Anonymized aggregate view per share link
- "Word cloud" or chart of most-selected adjectives
- Completion statistics (how many finished, avg duration)
- Export as PDF/CSV

**Technical approach:**
- Analytics already tracks assignments per session
- New endpoint: GET `/api/user/lists/{listId}/analytics`
- Aggregate queries on `analytics_assignments`
- Chart.js or similar for visualization

**Effort:** 8-12 hours

---

### 6. Offline Mode (PWA) (Medium Priority)
**Why needed:** School WiFi can be unreliable. Chromebooks may go offline mid-session.

**Scope:**
- Service worker for caching
- Offline sorting works with localStorage
- Sync when back online
- "Offline" indicator in UI

**Technical approach:**
- Vite PWA plugin
- Cache adjectives and static assets
- Queue API calls when offline
- Background sync on reconnect

**Effort:** 8-12 hours

---

### 7. Multi-language Support (Medium Priority)
**Why needed:** Swiss schools have French, Italian, and German regions.

**Scope:**
- UI text in DE/FR/IT
- Adjective lists per language (separate seeds)
- Language selector in header
- Remember preference

**Technical approach:**
- i18next or similar library
- Translation files (JSON)
- Language-specific adjective seeds
- URL prefix or cookie for language

**Effort:** 16-24 hours (initial setup + translations)

---

### 8. Print-Friendly View (Medium Priority)
**Why needed:** Teachers want to print hexagon results as posters or handouts.

**Scope:**
- Print button in results page
- Optimized CSS for print
- A4 landscape layout
- Hide navigation/buttons in print

**Technical approach:**
- `@media print` CSS rules
- `window.print()` trigger
- Hide non-essential elements
- Page break handling

**Effort:** 2-4 hours

---

### 9. License Code System (High for Monetization)
**Why needed:** Enable self-serve activation without manual admin intervention.

**Scope:**
- Generate license codes (VIEL-XXXX-XXXX format)
- Admin UI to create/manage codes
- User UI to redeem code
- Code sets `active_until` on user/school

**Technical approach:**
- New model: `license_codes` (code, type, duration_days, redeemed_by, redeemed_at)
- POST `/api/user/redeem-license`
- Admin endpoints for code generation
- Batch generation for school purchases

**Effort:** 8-12 hours

---

### 10. Stripe Payment Integration (High for Monetization)
**Why needed:** Automated billing and subscription management.

**Scope:**
- Checkout for individual teachers
- Checkout for school licenses
- Subscription management (cancel, upgrade)
- Invoice generation
- Webhook handling

**Technical approach:**
- Stripe Checkout or Payment Elements
- Stripe Billing for subscriptions
- Webhooks for payment events
- Customer portal for self-service

**Effort:** 20-30 hours

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Email Notifications
- Password Reset Flow
- Print-Friendly View

### Phase 2: Teacher Tools (Weeks 3-4)
- Bulk Import/Export
- Student Results History

### Phase 3: Monetization (Weeks 5-6)
- License Code System
- Basic Stripe Integration

### Phase 4: Expansion (Weeks 7-8)
- Class/Group Management
- Offline Mode (PWA)

### Phase 5: Localization (Weeks 9-12)
- Multi-language Support

---

## Dependencies Chart

```
Email Notifications
        │
        ▼
Password Reset Flow
        
Bulk Import/Export ──────► (standalone)

Class/Group Management
        │
        ▼
Student Results History

License Code System
        │
        ▼
Stripe Payment Integration

Offline Mode (PWA) ──────► (standalone)

Multi-language Support ──► (standalone, but affects all UI)
```

---

## Quick Wins (< 4 hours each)

1. **Print-Friendly View** - 2-4 hours, immediate value
2. **Bulk Export** - 2 hours, partial value delivery
3. **License Code Redemption UI** - 3 hours (if backend ready)

---

*Last Updated: 2026-02-03*
