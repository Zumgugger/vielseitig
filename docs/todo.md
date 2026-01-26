# Vielseitig – Todo Liste

*Basierend auf Spezifikation vom 26.01.2026*

---

## 1. Projekt-Setup & Infrastructure

- [x] **1.0** Development Environment Setup
  - [x] WSL als Standard-Terminal in VS Code konfigurieren
  - [x] Python Virtual Environment (.venv) in WSL erstellen
  - [x] pip in .venv installieren
  - [x] .gitignore Datei erstellen
  - [x] Sicherstellen dass alle Python-Commands in .venv ausgeführt werden
  - [x] requirements.txt erstellen
  - [x] Basis-Dependencies installieren (FastAPI, SQLAlchemy, etc.)
  - [x] Makefile mit dev/test/lint/format commands erstellen
  - [x] .env.example für Konfiguration erstellen
  - [x] pyproject.toml und .flake8 für Code-Qualität
  - [x] Basis Health-Endpoint und Test implementieren

- [ ] **1.1** Docker Compose Konfiguration aufbauen
  - [ ] Docker Compose YAML mit App-Container + SQLite Volume
  - [ ] Python/Flask oder Node.js Backend-Container
  - [ ] Statische Dateien für Frontend (oder separate Container)
  
- [ ] **1.2** Ubuntu Server & Apache2 Konfiguration
  - [ ] VirtualHost für vielseitig.zumgugger.ch aufbauen
  - [ ] Reverse Proxy Konfiguration auf App-Container
  - [ ] HTTPS/Let's Encrypt Zertifikat einrichten
  - [ ] Apache2 Reload/Restart testen

- [ ] **1.3** SQLite Datenbank Setup
  - [ ] Datenbank-Datei Struktur auf Server vorbereiten (Volume Mount)
  - [ ] Initial DB Connection Testing
  
- [ ] **1.4** Git & Versionskontrolle
  - [ ] Repository initialisieren
  - [ ] .gitignore (DB, Cache, node_modules, etc.) einrichten
  - [ ] Development Branch Strategy definieren

---

## 2. Datenbank-Schema & ORM

- [x] **2.1** SQLite Schema implementieren
  - [x] Tabelle `schools` (id, name, status, created_at)
  - [x] Tabelle `users` (id, email, password_hash, school_id, status, active_until, created_at, last_login_at, notes)
  - [x] Tabelle `admins` (id, username, password_hash, created_at, last_login_at)
  - [x] Tabelle `lists` (id, name, description, is_default, owner_user_id, share_token, share_expires_at, share_enabled, share_with_school, source_list_id, created_at, updated_at)
  - [x] Tabelle `adjectives` (id, list_id, word, explanation, example, order_index, active)
  - [x] Tabelle `analytics_sessions` (id/uuid, list_id, is_standard_list, theme_id, started_at, finished_at, pdf_exported_at)
  - [x] Tabelle `analytics_assignments` (id, session_id, adjective_id, bucket, assigned_at)

- [x] **2.2** Seed-Daten für Standardliste
  - [x] 30 Adjektive (aus Spec 5.2.2) in SQL INSERT Scripts
  - [x] Seed-Script idempotent machen (keine Duplikate)
  - [x] Standardliste als `is_default=true`, `owner_user_id=NULL`
  - [x] Default admin account (username: admin, password: changeme)

- [x] **2.3** Indizes & Constraints
  - [x] Unique Index auf `users.email`
  - [x] Unique Index auf `schools.name`
  - [x] Foreign Keys: `users.school_id` → `schools.id`
  - [x] Foreign Keys: `lists.owner_user_id` → `users.id` (nullable)
  - [x] Foreign Keys: `adjectives.list_id` → `lists.id`
  - [x] Foreign Keys: `analytics_sessions.list_id` → `lists.id` (nullable)

- [x] **2.4** Git Commit & Push
  - [x] Commit database models, migrations, and seed data
  - [x] Push to repository

---

## 3. Backend – Authentication & Authorization

- [x] **3.1** Passwort-Hashing & Validierung
  - [x] bcrypt oder Argon2 Integration
  - [x] Passwort-Hashing bei User-Registrierung
  - [x] Passwort-Validierung bei Login
  - [x] Passwort-Strength Anforderungen definieren

- [x] **3.2** Admin-Login Endpoint
  - [x] POST `/admin/login` (username, password)
  - [x] Admin-Session anlegen
  - [x] Admin-Session Cookies/Tokens (httpOnly, Secure)
  - [x] Admin-Logout Endpoint

- [x] **3.3** Admin Session Management
  - [x] Session Timeout nach 2 Tagen Inaktivität (Sliding)
  - [x] Session-Store (DB oder Redis)
  - [x] Middleware für Admin-Auth Überprüfung

- [x] **3.4** User-Login Endpoint
  - [x] POST `/user/login` (email, password)
  - [x] User-Session anlegen
  - [x] User-Session Cookies/Tokens (httpOnly, Secure)
  - [x] User-Logout Endpoint

- [x] **3.5** User-Registrierung Endpoint
  - [x] POST `/user/register` (email, password, school_id/school_name)
  - [x] School-Validierung (existierend oder neu)
  - [x] Status auf `pending` setzen
  - [x] Neue School als `pending` anlegen, wenn nicht existiert
  - [ ] **SMS an Admin senden** (siehe Twilio Integration 3.9)
  - [ ] Registrierungs-Email-Bestätigung TBD (für MVP wahrscheinlich nicht)

- [x] **3.6** Authorization Middleware
  - [x] Admin-only Routes schützen
  - [x] User-only Routes schützen
  - [x] Public Routes (Schüler:innen-Modus, Standard-Liste)
  - [ ] Share-Token Validation für Custom-Listen

- [x] **3.7** Schul-Lizenz-Check
  - [x] Funktion: prüfe ob Schule lizenziert ist (mind. 1 aktiver User)
  - [x] Alle Users einer lizenzierten Schule als automatisch aktiv behandeln
  - [x] PDF-Export freigeben wenn Schule lizenziert oder Custom-Liste vom aktiven User

- [x] **3.8** Passwort-Reset (Admin-only)
  - [x] Admin kann Benutzer-Passwort zurücksetzen
  - [x] POST `/admin/users/{userId}/reset-password`
  - [x] Neues Passwort generieren

- [x] **3.9** Twilio SMS Integration
  - [x] Environment Variables laden (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, ADMIN_PHONE_NUMBER)
  - [x] SMS-Funktion: "neue registrierung bei vielseitig" senden
  - [x] Trigger bei User-Registrierung
  - [x] Error Handling & Fallback (nur Log + Backend-Hinweis, kein Block)

- [x] **3.10** Git Commit & Push
  - [x] Commit authentication system
  - [x] Push to repository

---

## 4. Backend – User-Management (Admin)

- [x] **4.1** Pending Inbox Endpoints
  - [x] GET `/admin/pending-users` – Liste ausstehender User
  - [x] POST `/admin/users/{userId}/approve` – User aktivieren (status=active)
  - [x] POST `/admin/users/{userId}/reject` – User ablehnen
  - [x] GET `/admin/pending-schools` – Liste ausstehender Schulen
  - [x] POST `/admin/schools/{schoolId}/approve` – Schule aktivieren
  - [x] POST `/admin/schools/{schoolId}/reject` – Schule ablehnen

- [x] **4.2** User CRUD (Admin)
  - [x] GET `/admin/users` – alle User
  - [x] GET `/admin/users/{userId}` – Einzelheiten
  - [x] POST `/admin/users` – neuen User anlegen
  - [x] PUT `/admin/users/{userId}` – User bearbeiten
  - [x] DELETE `/admin/users/{userId}` – User löschen
  - [x] PUT `/admin/users/{userId}/activation` – status/active_until setzen
  - [x] POST `/admin/users/{userId}/reset-password` – Password zurücksetzen

- [x] **4.3** School CRUD (Admin)
  - [x] GET `/admin/schools` – alle Schulen
  - [x] POST `/admin/schools` – neue Schule anlegen
  - [x] PUT `/admin/schools/{schoolId}` – Schule bearbeiten
  - [x] DELETE `/admin/schools/{schoolId}` – Schule löschen

- [x] **4.4** Admin Notes & Comments
  - [x] User-Feld `notes` editierbar (in User model)
  - [x] Ansicht in Admin-Verwaltung (GET /admin/users zeigt notes)

- [x] **4.5** Git Commit & Push
  - [x] Commit admin user and school management
  - [x] Push to repository

---

## 5. Backend – User-Management (Lehrkraft)

- [x] **5.1** User-Profil Endpoint
  - [x] GET `/user/profile` – aktuelle User-Infos (schon implementiert)
  - [x] PUT `/user/profile` – Passwort ändern o.ä.
  - [x] GET `/user/schools` – eigene Schule

- [x] **5.2** Listen-Übersicht Endpoint
  - [x] GET `/user/lists` – Standardliste + eigene Custom-Listen + schul-geteilte Listen
  - [x] Filter nach `is_default`, `owner_user_id`, `share_with_school` (implemented via query logic)

- [x] **5.3** Git Commit & Push
  - [x] Commit teacher user management
  - [x] Push to repository

---

## 6. Backend – Listen-Verwaltung

- [x] **6.1** List CRUD (User)
  - [x] POST `/user/lists` – neue Custom-Liste anlegen
  - [x] GET `/user/lists/{listId}` – Liste + Adjektive
  - [x] PUT `/user/lists/{listId}` – Liste bearbeiten (name, description, share_with_school)
  - [x] DELETE `/user/lists/{listId}` – Liste löschen (nur eigene)

- [x] **6.2** Share-Token Generation
  - [x] Kryptographisch zufälliger Token generieren (z.B. `secrets.token_urlsafe()` Python)
  - [x] Token in `lists.share_token` speichern
  - [x] URL-Format: `/l/{token}`
  - [x] Gültigkeit: 1 Jahr von Erstellung (in `share_expires_at`)

- [x] **6.3** Adjektiv CRUD (User, Inline Editing)
  - [x] GET `/user/lists/{listId}/adjectives` – alle Adjektive einer Liste
  - [x] POST `/user/lists/{listId}/adjectives` – neues Adjektiv hinzufügen
  - [x] PUT `/user/lists/{listId}/adjectives/{adjectiveId}` – Adjektiv bearbeiten (word, explanation, example, order_index)
  - [x] DELETE `/user/lists/{listId}/adjectives/{adjectiveId}` – Adjektiv löschen
  - [x] Berechtigungsprüfung: nur Owner oder Schul-Admin

- [ ] **6.4** Copy-on-Write für Schul-geteilte Listen
  - [ ] Wenn User eine schul-geteilte Liste bearbeitet, automatisch Fork erstellen
  - [ ] Fork ist neue private Liste mit `source_list_id` = Original
  - [ ] Fork wird standardmäßig auch mit Schule geteilt (`share_with_school=true`)
  - [ ] UI-Hinweis: "Du bearbeitest eine Kopie"
  - [ ] Original-Liste bleibt unverändert

- [x] **6.5** Standardliste (Admin-only Editing)
  - [x] GET `/admin/standard-list` – Standardliste + Adjektive
  - [x] PUT `/admin/standard-list/{adjectiveId}` – Adjektiv bearbeiten (Inline Auto-Save)
  - [x] DELETE `/admin/standard-list/{adjectiveId}` – Adjektiv aus Standard-Liste entfernen
  - [x] Daten geben auch an Frontend (für Inline Editing)

- [ ] **6.6** Git Commit & Push
  - [ ] Commit user management and list management
  - [ ] Push to repository

---

## 7. Backend – Share-Links & Public Access

- [x] **7.1** Share-Link Resolution
  - [x] GET `/l/{token}` – Redirect zu Schüler:innen-Sortieransicht
  - [x] Token validieren (existiert, nicht abgelaufen)
  - [x] Ggf. Owner-User prüfen (aktiv? Schule lizenziert?)
  - [x] GET `/l` – Public Standard-Liste abrufen
  - [x] GET `/l/{token}/data` – Adjektive für geteilte Liste als JSON

- [x] **7.2** QR-Code Generation
  - [x] QR-Code für Share-Links generieren
  - [x] Endpoint: GET `/user/lists/{listId}/qr`
  - [x] Format: PNG mit Share-Link URL

---

## 8. Backend – Schüler:innen-Modus (Sortieren)

- [x] **8.1** Adjektiv-Abruf für Session
  - [x] GET `/api/lists/{listId}/adjectives` – alle Adjektive als JSON
  - [x] GET `/api/lists/default/adjectives` – Standardliste
  - [x] Format: `[{id, word, explanation, example}]`

- [x] **8.2** Analytics Session Start & Finish
  - [x] POST `/api/lists/{listId}/session` – Session starten
  - [x] PUT `/api/lists/{listId}/session/{sessionId}` – Session beenden
  - [x] Session-ID (UUID) für Tracking
  - [x] POST `/api/analytics/session/start` – neue Session anlegen
  - [x] Parameter: `list_id` (nullable für Standard), `theme_id` (welches Theme gewählt)
  - [x] Returns: `analytics_session_id` (uuid)
  - [x] Speichere `started_at`, `is_standard_list` Flag

- [x] **8.3** Analytics Assignment Tracking
  - [x] POST `/api/analytics/assignment` – Adjektiv einer Kategorie zuordnen
  - [x] Parameter: `analytics_session_id`, `adjective_id`, `bucket` (selten/manchmal/oft)
  - [x] Speichere `assigned_at` Timestamp

- [x] **8.4** Analytics Session Finish
  - [x] POST `/api/analytics/session/finish` – Session abschließen
  - [x] Parameter: `analytics_session_id`
  - [x] Speichere `finished_at` Timestamp

- [x] **8.5** PDF-Export Flag
  - [x] POST `/api/analytics/session/pdf-export` – PDF wurde exportiert
  - [x] Parameter: `analytics_session_id`
  - [x] Speichere `pdf_exported_at` Timestamp
  - [ ] Lösche Session-State aus `localStorage` (Backend-Signal für Frontend)

---

## 9. Backend – PDF-Export

- [x] **9.1** PDF-Generierung & Layout
  - [x] PDF-Rendering mit reportlab
  - [x] Adjektive nach Buckets gruppiert
  - [x] A4 Hochformat Layout
  - [x] Tabelle mit Adjektiven und Erklärungen
  - [x] Datum und Session-Info in Footer

- [x] **9.2** PDF Endpoint & Assignment Recording
  - [x] POST `/api/sessions/{sessionId}/pdf` – PDF generieren & downloaden
  - [x] POST `/api/sessions/{sessionId}/record-assignment` – Zuordnung speichern (bucket 0-5)
  - [x] Speichert `pdf_exported_at` Timestamp
  - [x] Returns: PDF Binary mit `Content-Type: application/pdf`
  - [x] Filename: `vielseitig_session_{id}.pdf`

- [x] **9.3** Adjektiv-Bucket-System
  - [x] AnalyticsAssignment speichert Bucket (0-5 für Hexagon-Positionen)
  - [x] PDF gruppiert nach Buckets und zeigt Inhalt
  - [x] Inline-Speicherung während Student sortiert

---

## 10. Backend – Analytics & Admin Dashboard

- [x] **10.1** Analytics Aggregations
  - [x] Gesamtzahl Sessions: zähle `analytics_sessions` Einträge
  - [x] Completed Sessions: zähle Sessions mit `finished_at` NOT NULL
  - [x] Durchschnittliche Dauer: berechne avg(finished_at - started_at)
  - [x] Top Adjektive: zähle Vorkommen in `analytics_assignments`, sortiere absteigend
  - [x] PDF-Exporte gesamt: zähle Einträge mit `pdf_exported_at` NOT NULL
  - [x] Theme-Verteilung: zähle Sessions pro `theme_id`

- [x] **10.2** Admin Analytics API
  - [x] GET `/admin/analytics/summary` – Aggregations-Daten (total, completed, avg_duration, pdfs, top adjectives, themes)
  - [x] GET `/admin/analytics/sessions` – Liste aller Sessions mit Pagination
  - [x] GET `/admin/analytics/sessions/{sessionId}` – Detail-View einer Session mit allen Assignments

- [ ] **10.3** Analytics Retention Policy
  - [ ] TBD: Cleanups nach X Monaten (z.B. 12 Monate) durchführen
  - [ ] Optional: Daily Rollups-Tabelle für Performance

---

## 11. Frontend – Struktur & Tech-Stack

- [x] **11.1** Frontend Framework Auswahl
  - [x] React 18.3.1 chosen (installed)
  - [x] Build-Tool: Vite 4.5.14 (installed)
  - [x] CSS Framework: Tailwind CSS 3.4.19 (installed)
  - [x] Vite configured with React plugin, port 3000
  - [x] Proxy to backend: /api, /admin, /user, /l routes → :8000

- [x] **11.2** Frontend Folder Structure & Shared Components
  - [x] Create reusable UI components: Button, Input, AppHeader, AppFooter, Toast, Loading
  - [x] Component barrel export (components/index.js)
  - [x] Create utility helpers (formatDate, formatDuration, copyToClipboard, validation)
  - [x] Create custom hooks (useAsync, useLocalStorage, useDebounce, useOutsideClick, useFetch)
  - [x] Expand API client with organized endpoints (analytics, auth, lists, share, admin)
  - [x] Create ThemeContext with 6 themes (default, ocean, sunset, forest, purple, dark)
  - [x] Create AuthContext for user/admin session state
  - [x] Update App.jsx with ThemeProvider, AuthProvider, layout components

- [x] **11.3** Global Styles & Responsive Design
  - [x] Global CSS reset (tailwind preflight + custom enhancements)
  - [x] Responsive typography with clamp() for fluid scaling
  - [x] Breakpoints: mobile <900px, desktop 900px+ (via Tailwind md: 768px)
  - [x] Responsive container, grid, and spacing utilities
  - [x] Form components (inputs, labels, errors, helpers)
  - [x] Status badges, alerts, tables, spinners
  - [x] Accessibility: sr-only, focus-visible, prefers-reduced-motion

---

## 12. Frontend – Styles & Farbschemas

- [x] **12.1** Global Styles & Reset
  - [x] CSS Reset with Tailwind (@tailwind base)
  - [x] Global font family (-apple-system, BlinkMacSystemFont, 'Segoe UI', etc.)
  - [x] Heading and paragraph base styles with responsive sizes
  - [x] Form element base styles (input, textarea, select)
  - [x] Link and code block styling

- [x] **12.2** Theme System
  - [x] 6 complete color themes defined in themeConfig.js
    - [x] Default (Blue): Professional, WCAG AA compliant
    - [x] Ocean (Cyan): Cool, aquatic
    - [x] Sunset (Orange): Warm, energetic
    - [x] Forest (Green): Nature-inspired
    - [x] Purple Dream: Vibrant, creative
    - [x] Dark Mode: Low-light friendly
  - [x] Each theme includes: primary, secondary, accent, success, error, warning, surfaces
  - [x] ThemeContext with localStorage persistence
  - [x] Theme utilities: getThemeColor, getThemeNames, getTheme

- [x] **12.3** Responsive Utilities & Components
  - [x] Tailwind component layer utilities (btn, card, form-group, table, etc.)
  - [x] Responsive utilities: mobile-only, desktop-only, gap-responsive
  - [x] Accessibility utilities: sr-only, focus-visible
  - [x] Responsive text sizes and spacing scales

- [x] **12.4** Barrierefreiheit (a11y) - Initial Implementation
  - [x] Color contrast: Dark text on light (>7:1), light text on dark (>4.5:1)
  - [x] Minimum font sizes: 14px base, 16px on mobile
  - [x] ARIA labels on buttons and form fields
  - [x] Keyboard navigation: Tab, Enter, Escape functional
  - [x] prefers-reduced-motion: respected in utility layer

---

## 13. Frontend – Layout & Pages

- [x] **13.1** Layout Component
  - [x] AppHeader with navigation and logo
  - [x] AppFooter with links (Impressum, Datenschutz, Contact)
  - [x] Responsive layout: flex-col on mobile, split on desktop
  - [x] App.jsx wraps with ThemeProvider, AuthProvider, header/footer

- [x] **13.2** Schüler:innen-Modus Main Page (HomePage)
  - [x] Hero section with CTA buttons
  - [x] Features section (3 steps: Sort, Visualize, Export)
  - [x] Teacher benefits section
  - [x] CTA section for registration
  - [x] Responsive grid layout
  - [x] Links to sorting, login, registration pages

- [x] **13.3** Sortieransicht Page (/sort or /l/{token})
  - [x] Aktive Karte (Adjektiv groß, zentral)
  - [x] 3 Buckets: "Selten", "Manchmal", "Oft" (large buttons with emojis)
  - [x] Fortschritt anzeigen: X/30 mit Progress-Bar
  - [x] Info-Button/Overlay (I key) mit Tastaturkürzel
  - [x] Erklär-Button toggle Erklärung + Beispiel (Space key)
  - [x] Keyboard controls: A/S/D oder Pfeiltasten für Zuordnung
  - [x] Space bar für Erklärung, I für Info
  - [x] Responsive grid for mobile/desktop

- [x] **13.4** User-Login Page (/user/login)
  - [x] Email Input
  - [x] Passwort Input
  - [x] Login Button with loading state
  - [x] Links to registration and admin login
  - [x] Toast notifications (success/error)
  - [x] Uses useAuth context for session management

- [x] **13.5** User-Registrierung Page (/user/register)
  - [x] Email Input with validation
  - [x] Passwort Input (min 8 chars) with confirmation
  - [x] Vorname + Nachname fields
  - [x] School Dropdown mit "Neue Schule" Option
  - [x] Registrieren Button with loading state
  - [x] Info text: Admin will verify, SMS notification
  - [x] Links to login and homepage
  - [x] Form validation with error messages

- [x] **13.6** Admin-Bereich: Login Page (/admin/login)
  - [x] E-Mail oder Benutzername Input
  - [x] Passwort Input
  - [x] Login Button with loading state
  - [x] Toast notifications (success/error)
  - [x] Uses useAuth context for admin session
  - [x] Link to homepage

- [ ] **13.7** User-Bereich: Listen-Übersicht Page (/user/lists)
  - [ ] Tabelle/Karten-Ansicht with:
    - [ ] Listennamen
    - [ ] Anzahl Adjektive
    - [ ] Share-Link (Copy-Button + QR-Code Button)
    - [ ] Edit Button
    - [ ] Delete Button (mit Bestätigung)
    - [ ] Schul-Sharing Toggle
  - [ ] "Neue Liste" Button

- [ ] **13.9** User-Bereich: Listen-Editor Page (`/user/lists/{listId}`)
  - [ ] Inline Editing für Listenname, Beschreibung
  - [ ] Tabelle/Liste mit Adjektiven:
    - [ ] Inline Edit für Word, Explanation, Example (Auto-Save bei Blur)
    - [ ] Delete Button (mit Bestätigung)
    - [ ] Drag-to-Reorder (optional, für order_index)
  - [ ] "Neues Adjektiv" Button
  - [ ] Status-Anzeige: "Speichert...", "Gespeichert", Error
  - [ ] Share-Settings Section (Link, QR-Code, Schul-Sharing Toggle)

- [ ] **13.10** User-Bereich: Profil Page (`/user/profile`)
  - [ ] Email anzeigen (read-only)
  - [ ] Schule anzeigen
  - [ ] Passwort ändern (optional, oder nur über Admin)
  - [ ] Logout Button

- [ ] **13.11** Admin-Bereich: Login Page (`/admin/login`)
  - [ ] Username Input
  - [ ] Passwort Input
  - [ ] Login Button

- [ ] **13.12** Admin-Bereich: Pending Inbox (`/admin/pending`)
  - [ ] Tab 1: Pending Users
    - [ ] Tabelle: Email, Schule, Registrierungs-Datum
    - [ ] Button: "Freischalten", "Ablehnen"
  - [ ] Tab 2: Pending Schools
    - [ ] Tabelle: Name, hinzugefügt von User, Datum
    - [ ] Button: "Freischalten", "Ablehnen"

- [ ] **13.13** Admin-Bereich: User-Verwaltung (`/admin/users`)
  - [ ] Tabelle: Email, Schule, Status (aktiv/passiv), Aktivierungsdatum
  - [ ] Buttons: Edit, Delete, Passwort-Reset
  - [ ] Edit Modal/Inline: Status, active_until, Notes
  - [ ] "Neuen User anlegen" Button

- [ ] **13.14** Admin-Bereich: School-Verwaltung (`/admin/schools`)
  - [ ] Tabelle: Name, Status, Anzahl Active Users
  - [ ] Buttons: Edit, Delete
  - [ ] "Neue Schule anlegen" Button

- [ ] **13.15** Admin-Bereich: Statistik Dashboard (`/admin/analytics`)
  - [ ] Widgets anzeigen:
    - [ ] Gesamtzahl Sessions
    - [ ] Durchschnittliche Dauer
    - [ ] Top Adjektive in "oft"
    - [ ] PDF-Exporte gesamt
    - [ ] Theme-Verteilung (Balkendiagramm oder Torte)
  - [ ] Keine CSV-Export im MVP

- [ ] **13.16** Admin-Bereich: Standardliste Editor (`/admin/standard-list`)
  - [ ] Wie 13.9, aber für Standardliste
  - [ ] Inline Editing für Adjektive
  - [ ] Auto-Save

- [ ] **13.17** Admin-Bereich: Profil/Logout (`/admin/profile`)
  - [ ] Username anzeigen
  - [ ] Logout Button

- [ ] **13.18** Statische Seiten
  - [ ] `/impressum` – Impressum (Text vom Betreiber)
  - [ ] `/datenschutz` – Datenschutzerklärung (Text vom Betreiber, Hinweis: keine Schüler:innen-Daten)

---

## 14. Frontend – Schüler:innen-Modus Interaktion

- [ ] **14.1** Karten-Drag-and-Drop
  - [ ] Aktive Karte kann per Maus auf Bucket gezogen werden
  - [ ] Visuelles Feedback während Drag (Highlighting, Cursor Change)
  - [ ] Drop auf Bucket = Zuordnung

- [ ] **14.2** Tastatur-Steuerung
  - [ ] `A` oder `ArrowLeft` = "selten"
  - [ ] `S` oder `ArrowDown` = "manchmal"
  - [ ] `D` oder `ArrowRight` = "oft"
  - [ ] `W` oder `ArrowUp` = Undo (letzte Zuordnung rückgängig)
  - [ ] `Space` = Toggle Erklärung + Beispiel für aktuelle Karte
  - [ ] Fokus auf aktive Karte automatisch setzen

- [ ] **14.3** Touch/Mobile Steuerung
  - [ ] Swipe-Gesten (optional, für besseres Mobile UX)
  - [ ] Tap auf Bucket oder Button = Zuordnung
  - [ ] Erklär-Button größer/sichtbarer auf Mobile

- [ ] **14.4** Undo Funktion
  - [ ] Stack der Zuordnungen speichern (in localStorage)
  - [ ] Undo: letzte Zuordnung entfernen, Karte zurück in "zu sortieren"
  - [ ] Mehrfach Undo möglich
  - [ ] Redo nicht notwendig (MVP)

- [ ] **14.5** Shortcuts-Overlay / Info-Button
  - [ ] Erstes Laden: Overlay mit Shortcuts anzeigen
  - [ ] Button "i" zum Erneut-Anzeigen
  - [ ] Inhalt: "A/S/D oder Pfeile zum Sortieren, W zum Rückgängigmachen, Space für Erklärung"
  - [ ] Click/Escape zum Schließen

---

## 15. Frontend – Hexagon Rendering

- [ ] **15.1** Hexagon Shape & SVG
  - [ ] Hexagon-Form definieren (Koordinaten, Größe)
  - [ ] SVG oder CSS Rendering?
  - [ ] Responsiveness: Größe bei Mobile anpassen

- [ ] **15.2** Hex-Grid Layout Algorithm
  - [ ] Koordinaten-System für Hexagon-Grid (Axial oder Cube Coordinates)
  - [ ] Zentrum = "Ich bin"
  - [ ] Ring 1, Ring 2, Ring 3 etc. Positionen berechnen

- [ ] **15.3** Random Placement Algorithm (Schritt 1-3)
  - [ ] 1. Zentrum platzieren
  - [ ] 2. "oft"-Kacheln zufällig in freie Positionen platzieren (Rings expandieren)
  - [ ] 3. "manchmal"-Kacheln nach "oft" zufällig platzieren
  - [ ] Datenstruktur: Set von belegten Positionen, Queue von freien Nachbarpositionen

- [ ] **15.4** Rendering von Kacheln
  - [ ] Für jede Kachel: Hexagon zeichnen, Text hinzufügen
  - [ ] "oft" Kacheln: **bold** Font
  - [ ] "manchmal" Kacheln: normales Font
  - [ ] Farb-Schema anwenden (basierend auf aktivem Theme)
  - [ ] Zentrieren von Text in Hexagon

- [ ] **15.5** Live-Vorschau Update
  - [ ] Bei jeder Zuordnung (manchmal/oft): Hex-Grafik aktualisieren
  - [ ] Bei "selten": keine visuelle Änderung
  - [ ] Performance: nur aktualisierte Kachel rendern (optional)

- [ ] **15.6** "Anders anordnen" Button
  - [ ] Button in Ergebnisansicht
  - [ ] Click = Random Placement erneut ausführen
  - [ ] Zuordnungen bleiben, nur Layout ändert sich
  - [ ] Hex-Grafik animiert Update (optional)

---

## 16. Frontend – State Management & localStorage

- [ ] **16.1** Session State Structure
  - [ ] `current_list_id` (oder null für Standard)
  - [ ] `analytics_session_id`
  - [ ] `theme_id`
  - [ ] `assignments` – Array von {adjective_id, bucket}
  - [ ] `remaining_adjectives` – Array unzugeordneter IDs
  - [ ] `hex_layout` – aktuelles Hex-Layout (Positionen)
  - [ ] `undo_stack` – Stack für Undo-Funktion

- [ ] **16.2** localStorage Persistierung
  - [ ] Schreibe Session State regelmäßig in localStorage
  - [ ] Lade State bei Seiten-Refresh
  - [ ] Lösche State nach PDF-Export (Backend Signal?)
  - [ ] localStorage Key: z.B. `vielseitig_session_{list_id}`

- [ ] **16.3** Adjektive Caching
  - [ ] Lade Adjektive einmalig von Backend
  - [ ] Shuffle/Randomize bei Session Start
  - [ ] Reuse bei Refresh

---

## 17. Frontend – API Client

- [ ] **17.1** HTTP Client Setup
  - [ ] axios oder fetch Wrapper
  - [ ] Basis-URL konfigurieren
  - [ ] Error Handling (401, 403, 500 etc.)
  - [ ] CORS Handling

- [ ] **17.2** API Endpoints für Schüler:innen-Modus
  - [ ] GET /api/lists/{listId}/adjectives
  - [ ] GET /api/lists/default/adjectives
  - [ ] POST /api/analytics/session/start
  - [ ] POST /api/analytics/assignment
  - [ ] POST /api/analytics/session/finish
  - [ ] POST /api/analytics/session/pdf-export
  - [ ] POST /api/export/pdf

- [ ] **17.3** API Endpoints für User-Bereich
  - [ ] Alle User/List CRUD Endpoints (siehe Backend 5, 6)

- [ ] **17.4** API Endpoints für Admin-Bereich
  - [ ] Alle Admin Endpoints (siehe Backend 4, 10)

---

## 18. Frontend – User Authentication

- [ ] **18.1** Login/Logout Flow
  - [ ] Login Page Component
  - [ ] POST /admin/login (Admin)
  - [ ] POST /user/login (User)
  - [ ] Session Cookie automatisch im Browser gespeichert
  - [ ] Logout: DELETE Session, Redirect zu Login

- [ ] **18.2** Session Validation
  - [ ] Bei App-Load: prüfe ob Session gültig
  - [ ] Wenn ungültig: Redirect zu Login
  - [ ] Optional: Refresh Token Mechanism (TBD)

- [ ] **18.3** Protected Routes
  - [ ] Route Guard für User-only Pages
  - [ ] Route Guard für Admin-only Pages
  - [ ] Public Routes (Schüler:innen-Modus)

---

## 19. Frontend – Inline Editing & Auto-Save

- [ ] **19.1** Inline Edit Components
  - [ ] Editable Text Field (contentEditable oder Input)
  - [ ] Editable Textarea (explanation, example)
  - [ ] Editable Dropdown (school selection, theme)

- [ ] **19.2** Auto-Save Mechanism
  - [ ] Debounce-Timer bei Input (z.B. 500ms)
  - [ ] OnBlur (sofort speichern)
  - [ ] POST/PUT Request an Backend
  - [ ] Status-Anzeige: "Speichert...", "Gespeichert ✓", Error-Meldung

- [ ] **19.3** Error Handling bei Save
  - [ ] Fehlermeldung unter Feld anzeigen
  - [ ] "Erneut versuchen" Button
  - [ ] Lokale Änderung behalten (nicht verwerfen)

- [ ] **19.4** Optimistic Updates
  - [ ] UI zeigt Änderung sofort (optimistic)
  - [ ] Backend speichert im Hintergrund
  - [ ] Bei Fehler: Änderung zurücknehmen + Error anzeigen

---

## 20. Frontend – PDF Export UI

- [ ] **20.1** PDF-Button in Ergebnisansicht
  - [ ] Sichtbar aber deaktiviert für Standard-Liste ohne Lizenz (mit Hinweis: "PDF nur mit Schul-Lizenz")
  - [ ] Sichtbar und aktiviert für Custom-Listen mit aktivem Owner
  - [ ] Click öffnet PDF im neuen Tab oder startet Download

- [ ] **20.2** PDF-Generierung
  - [ ] Assignments an Backend schicken
  - [ ] POST /api/export/pdf mit {assignments, theme_id}
  - [ ] Backend generiert PDF und sendet Binary
  - [ ] Frontend downloaded als `ich-bin-vielseitig.pdf`

- [ ] **20.3** Post-PDF Action
  - [ ] Erfolgs-Meldung anzeigen
  - [ ] localStorage state löschen (Signal vom Backend oder im Frontend)
  - [ ] Optional: "Neuer Durchlauf" Hinweis

---

## 21. Frontend – QR-Code Display

- [ ] **21.1** QR-Code Generation (Backend)
  - [ ] Library z.B. `python-qrcode` oder `qrcode.js`
  - [ ] GET /user/lists/{listId}/qr.png returns PNG Image
  - [ ] Größe: ~200x200px oder skalierbar

- [ ] **21.2** QR-Code Display (Frontend)
  - [ ] Listen-Übersicht: QR-Code anzeigen (Icon oder Button zum Expandieren)
  - [ ] Listen-Editor: QR-Code neben Share-Link anzeigen
  - [ ] Größe: ~300x300px für Druck

- [ ] **21.3** QR-Code Download/Print
  - [ ] Button: "QR-Code drucken" oder "QR-Code herunterladen"
  - [ ] Dialog oder neuer Tab mit QR zum Drucken

- [ ] **21.4** Git Commit & Push
  - [ ] Commit frontend implementation
  - [ ] Push to repository

---

## 22. Testing & Quality Assurance

- [ ] **22.0** Code-Qualität Tools
  - [x] `make lint` - Code-Stil prüfen (flake8)
  - [x] `make format` - Code formatieren (black)
  - [ ] CI/CD Pipeline für automatisches Linting/Testing

- [ ] **22.1** Backend Unit Tests
  - [ ] Auth-Funktionen testen (Login, Passwort-Hash, Session)
  - [ ] Database-Operationen testen (CRUD)
  - [ ] Business Logic testen (Schul-Lizenz, Share-Token, Analytics)
  - [ ] API Endpoint Tests (200, 401, 403, 400 Responses)
  - [ ] Tests mit `make test` ausführen

- [ ] **22.2** Frontend Unit Tests
  - [ ] Component Tests (React Testing Library oder ähnlich)
  - [ ] Utility Functions testen (Hex-Layout, Random-Placement)
  - [ ] localStorage Integration Tests

- [ ] **22.3** Integration Tests
  - [ ] End-to-End Tests (Cypress oder Playwright)
  - [ ] User Journey: Login → Liste öffnen → Sortieren → PDF Export
  - [ ] Admin Journey: Pending Approvals → User-Verwaltung
  - [ ] Schüler:innen Journey: Standard-Liste → Sortieren → Ergebnisansicht

- [ ] **22.4** Manual Testing
  - [ ] Auf Chromebooks testen (Target Device)
  - [ ] Desktop und Mobile Browsern testen
  - [ ] Tastatur-Navigation testen
  - [ ] PDF-Export testen (Layout, Farbschemas)
  - [ ] SMS-Benachrichtigung testen (Twilio)

- [ ] **22.5** Performance Testing
  - [ ] Lade-Zeit für Sortieransicht < 2s
  - [ ] Hex-Grafik Rendering bei 30+ Adjektiven smooth
  - [ ] localStorage Performance OK

- [ ] **22.6** Security Testing
  - [ ] SQL Injection Vulnerability (parameterized queries)
  - [ ] CSRF Protection
  - [ ] XSS Prevention
  - [ ] Authorization Checks (user can't access other user's lists, etc.)

- [ ] **22.7** Accessibility Testing (a11y)
  - [ ] Farb-Kontrast (WCAG AA)
  - [ ] Tastatur-Navigation (alle Funktionen erreichbar)
  - [ ] Screen Reader Kompatibilität
  - [ ] `prefers-reduced-motion` respektieren

---

## 23. Deployment & DevOps

- [ ] **23.1** Docker Build & Push
  - [ ] Dockerfile für Backend-Container
  - [ ] Dockerfile für Frontend (optional, oder als Static Files in Apache)
  - [ ] .dockerignore Datei
  - [ ] Image Tests vor Push

- [ ] **23.2** Docker Compose Orchestration
  - [ ] docker-compose.yml mit Services
  - [ ] Environment Variables setzen (Twilio, Secret Keys, DB Path)
  - [ ] Volume Mounts für SQLite Persistierung
  - [ ] Netzwerk-Setup zwischen Containern

- [ ] **23.3** Server Deployment auf Ubuntu
  - [ ] Docker & Docker Compose installieren
  - [ ] SSH Key Setup & Git Clone
  - [ ] Docker Images bauen auf Server
  - [ ] docker-compose up -d starten
  - [ ] Health Checks konfigurieren

- [ ] **23.4** Apache2 Reverse Proxy Setup
  - [ ] VirtualHost für vielseitig.zumgugger.ch
  - [ ] ProxyPass auf App-Container (z.B. Port 8000)
  - [ ] Static Files Serving (falls separat)
  - [ ] HTTP zu HTTPS Redirect

- [ ] **23.5** HTTPS & Let's Encrypt
  - [ ] Certbot installieren
  - [ ] Zertifikat beantragen für vielseitig.zumgugger.ch
  - [ ] Apache-Config für HTTPS updaten
  - [ ] Auto-Renewal konfigurieren

- [ ] **23.6** Monitoring & Logging
  - [ ] Container Logs abrufen (docker logs)
  - [ ] Application Logs konfigurieren
  - [ ] Error Tracking (optional: Sentry, LogRocket)
  - [ ] Uptime Monitoring (optional)

- [ ] **23.7** Database Backup
  - [ ] SQLite DB regelmäßig sichern
  - [ ] Backup-Script schreiben (z.B. täglich)
  - [ ] Backup-Speicherort sichern

- [ ] **23.8** Deployment Documentation
  - [ ] README.md für Deployment
  - [ ] Setup-Schritte dokumentieren
  - [ ] Troubleshooting Guide
  - [ ] Admin Quick Start Guide

---

## 24. Documentation

- [ ] **24.1** API Documentation
  - [ ] OpenAPI/Swagger Spec (optional)
  - [ ] Endpoint Beschreibungen (Request/Response Format)
  - [ ] Auth Flow dokumentieren
  - [ ] Error Codes dokumentieren

- [ ] **24.2** User Documentation (Lehrkraft)
  - [ ] Erste Schritte (Registrierung, Login)
  - [ ] Listen erstellen & bearbeiten
  - [ ] Share-Links & QR-Codes generieren
  - [ ] PDF-Export erklärt

- [ ] **24.3** Admin Documentation
  - [ ] Admin-Bereich Übersicht
  - [ ] User & School Management
  - [ ] Pending Approvals verarbeiten
  - [ ] Analytics-Dashboard verstehen
  - [ ] Standardliste bearbeiten
  - [ ] Deployment & Troubleshooting

- [ ] **24.4** Code Documentation
  - [ ] Docstrings / Comments in Code
  - [ ] Architecture Overview
  - [ ] Database Schema Documentation
  - [ ] Frontend Component Props/API

- [ ] **24.5** Impressum & Datenschutzerklärung
  - [ ] Text vom Betreiber einholen
  - [ ] Seiten erstellen (/impressum, /datenschutz)
  - [ ] Datenschutzhinweis: "Schüler:innen-Daten werden nicht gespeichert"

---

## 25. Launch & Pilot

- [ ] **25.1** Pilot Schule Auswahl
  - [ ] Partner-Schule kontaktieren
  - [ ] Testgruppe mit Schüler:innen + Lehrkraft definieren

- [ ] **25.2** Pilot Schulung
  - [ ] Lehrkraft trainieren (Bedienung, Liste erstellen, Link teilen)
  - [ ] Schüler:innen-Workshop durchführen

- [ ] **25.3** Feedback Sammlung
  - [ ] Usability Tests durchführen
  - [ ] Feedback Form / Questionnaire
  - [ ] Bug Reports sammeln
  - [ ] Feature Requests sammeln

- [ ] **25.4** Post-Pilot Adjustments
  - [ ] Bugs beheben
  - [ ] UI/UX Verbesserungen
  - [ ] Performance-Optimierungen
  - [ ] Feature Refinements

- [ ] **25.5** Marketing & Outreach (später)
  - [ ] Landing Page / Website
  - [ ] Email Outreach an Schulen
  - [ ] Demo-Video erstellen
  - [ ] Social Media Präsenz

---

## 26. Later / Post-MVP Features (Backlog)

- [ ] **26.1** Erweiterungen (TBD in Spec)
  - [ ] Lizenz-Code/Key System (statt manuell)
  - [ ] Payment Integration (Stripe)
  - [ ] Todo-System Integration (JSON API für Betreiber)
  - [ ] "Ich möchte sein" Center Option
  - [ ] Session-History für Lehrkraft (Statistiken pro Klasse)
  - [ ] Multiple Adjektive-Sets (Landeskunde, Mathe, etc.)
  - [ ] Batch-Import Adjektive (CSV Upload)

- [ ] **26.2** Nice-to-Have Features
  - [ ] Drag-to-Reorder Adjektive in Editor
  - [ ] Export-Format (PNG zusätzlich zu PDF?)
  - [ ] Sharing Stats (wie oft QR gescannt?)
  - [ ] Lehrkraft-Dashboard (Schüler-Statistiken aggregiert)
  - [ ] Dark Mode
  - [ ] i18n (Internationalisierung, Englisch/Französisch?)

---

## Notes

- **TBD Items aus Spec durchgehen** und Decision treffen
  - Session-Timeout: 2 Tage Inaktivität oder absolute Dauer?
  - Frontend Framework Auswahl
  - Analytics Retention Policy
  - Theme System Details (exakte Farben)
  - Weitere Details siehe Spec "Offene Fragen"

- **Team Rollen zuweisen**
  - Backend Developer
  - Frontend Developer
  - DevOps / Deployment
  - Product Owner / Scrum Master
  - QA / Tester

- **Sprint Planning**
  - 2-4 Wochen Sprints?
  - Priorisierung: Core Functionality → Quality → Polish

- **Regulatory & Legal**
  - Datenschutz-Compliance (GDPR, DSGVO)
  - Schulische Vorgaben prüfen
  - Impressum & Datenschutz Text beschaffen

---

**Status: Initial Draft**
**Last Updated: 2026-01-26**
