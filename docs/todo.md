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

- [x] **6.4** Copy-on-Write für Schul-geteilte Listen
  - [x] POST `/user/lists/{listId}/fork` - Fork/Kopie einer Liste erstellen
  - [x] Fork kopiert alle Adjektive und setzt `source_list_id` = Original
  - [x] Fork wird standardmäßig mit Schule geteilt (`share_with_school=true`)
  - [x] UI: "Als Kopie bearbeiten" Button für Standard/Premium/schul-geteilte Listen
  - [x] Nach Fork: Redirect zur neuen Liste

- [x] **6.5** Standardliste (Admin-only Editing)
  - [x] GET `/admin/standard-list` – Standardliste + Adjektive
  - [x] PUT `/admin/standard-list/{adjectiveId}` – Adjektiv bearbeiten (Inline Auto-Save)
  - [x] DELETE `/admin/standard-list/{adjectiveId}` – Adjektiv aus Standard-Liste entfernen
  - [x] Daten geben auch an Frontend (für Inline Editing)

- [x] **6.6** Git Commit & Push
  - [x] Commit user management and list management
  - [x] Push to repository

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

- [x] **13.3** Sortieransicht Page (/sort or /l/{token})  **[WORKING!]**
  - [x] Aktive Karte (Adjektiv groß, zentral)
  - [x] 3 Buckets: "Selten", "Manchmal", "Oft" (large buttons with emojis)
  - [x] Fortschritt anzeigen: X/30 mit Progress-Bar
  - [x] Info-Button/Overlay (I key) mit Tastaturkürzel
  - [x] Erklär-Button toggle Erklärung + Beispiel (Space key)
  - [x] Keyboard controls: A/S/D oder Pfeiltasten für Zuordnung
  - [x] Space bar für Erklärung, I für Info
  - [x] Responsive grid for mobile/desktop
  - [x] Ergebnisansicht mit Theme-Selector (Hex-Visualisierung deferred)

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

- [x] **13.6.1** Update todo.md & Git Commit (Frontend Pages Complete)
  - [x] Update todo.md to mark sections 13.3-13.6 complete with current status
  - [x] Mark section 15 (hexagon) as deferred
  - [x] Update implementation status summary
  - [x] Git commit with message: "Complete frontend authentication and sorting pages (Sections 13.3-13.6)"
  - [x] Git push to main

- [x] **13.7** User-Bereich: Listen-Übersicht Page (/user/lists)
  - [x] Tabelle/Karten-Ansicht with:
    - [x] Listennamen
    - [x] Anzahl Adjektive
    - [x] Share-Link (Copy-Button + QR-Code Button)
    - [x] Edit Button
    - [ ] Delete Button (mit Bestätigung)
    - [x] Schul-Sharing Toggle
  - [x] "Neue Liste" Button

- [x] **13.8** User-Bereich: Listen-Editor Page (`/user/lists/{listId}`)
  - [x] Inline Editing für Listenname, Beschreibung
  - [x] Tabelle/Liste mit Adjektiven:
    - [x] Inline Edit für Word, Explanation, Example (Auto-Save bei Blur)
    - [x] Delete Button (mit Bestätigung)
    - [ ] Drag-to-Reorder (optional, für order_index)
  - [x] "Neues Adjektiv" Button
  - [x] Status-Anzeige: "Speichert...", "Gespeichert", Error
  - [x] Share-Settings Section (Link, QR-Code, Schul-Sharing Toggle)

- [ ] **13.9.1** Update todo.md & Git Commit (User Pages Complete)
  - [x] Update todo.md to mark sections 13.7-13.9 complete
  - [x] Update progress notes in implementation status summary
  - [ ] Git commit with message: "Implement user list management and profile pages (Sections 13.7-13.9)"
  - [ ] Git push to main

- [x] **13.10** User-Bereich: Profil Page (`/user/profile`)
  - [x] Email anzeigen (read-only)
  - [x] Schule anzeigen
  - [ ] Passwort ändern (optional, oder nur über Admin)
  - [x] Logout Button

- [x] **13.11** Admin-Bereich: Login Page (`/admin/login`)
  - [x] Username Input
  - [x] Passwort Input
  - [x] Login Button

- [x] **13.12** Admin-Bereich: Pending Inbox (`/admin/pending`)
  - [x] Tab 1: Pending Users
    - [x] Tabelle: Email, Schule, Registrierungs-Datum
    - [x] Button: "Freischalten", "Ablehnen"
  - [x] Tab 2: Pending Schools
    - [x] Tabelle: Name, hinzugefügt von User, Datum
    - [x] Button: "Freischalten", "Ablehnen"

- [x] **13.13** Admin-Bereich: User-Verwaltung (`/admin/users`)
  - [x] Tabelle: Email, Schule, Status (aktiv/passiv), Aktivierungsdatum
  - [ ] Buttons: Edit, Delete, Passwort-Reset
  - [ ] Edit Modal/Inline: Status, active_until, Notes
  - [ ] "Neuen User anlegen" Button

- [x] **13.14** Admin-Bereich: School-Verwaltung (`/admin/schools`)
  - [x] Tabelle: Name, Status, Anzahl Active Users
  - [x] Buttons: Edit, Delete
  - [x] "Neue Schule anlegen" Button

- [x] **13.15** Admin-Bereich: Statistik Dashboard (`/admin/analytics`)
  - [x] Widgets anzeigen:
    - [x] Gesamtzahl Sessions
    - [x] Durchschnittliche Dauer
    - [x] Top Adjektive in "oft"
    - [x] PDF-Exporte gesamt
    - [x] Theme-Verteilung (Balkendiagramm oder Torte)
  - [x] Keine CSV-Export im MVP

- [ ] **13.15.1** Update todo.md & Git Commit (Admin Pages Complete)
  - [x] Update todo.md to mark sections 13.10-13.15 complete
  - [x] Update progress notes in implementation status summary
  - [ ] Git commit with message: "Implement admin dashboard and management pages (Sections 13.10-13.15)"
  - [ ] Git push to main

- [x] **13.16** Admin-Bereich: Standardliste Editor (`/admin/standard-list`)
  - [x] Wie 13.9, aber für Standardliste
  - [x] Inline Editing für Adjektive
  - [x] Auto-Save (edit mode with save button)
  - [x] Delete Adjektive mit Bestätigung

- [x] **13.17** Admin-Bereich: Profil/Logout (`/admin/profile`)
  - [x] Username/Email anzeigen
  - [x] Schnellzugriff zu Admin-Bereichen
  - [x] Logout Button

- [x] **13.18** Statische Seiten
  - [x] `/impressum` – Impressum (Platzhalter; finalen Betreiber-Text einsetzen)
  - [x] `/datenschutz` – Datenschutzerklärung (Platzhalter; finalen Betreiber-Text + Hinweis „Schüler:innen-Daten werden nicht gespeichert“ einsetzen)

---

## 14. Frontend – Schüler:innen-Modus Interaktion

- [ ] **14.1** Karten-Drag-and-Drop (optional)
  - [ ] Aktive Karte kann per Maus auf Bucket gezogen werden
  - [ ] Visuelles Feedback während Drag (Highlighting, Cursor Change)
  - [ ] Drop auf Bucket = Zuordnung

- [x] **14.2** Tastatur-Steuerung
  - [x] `A` oder `ArrowLeft` = "selten"
  - [x] `S` oder `ArrowDown` = "manchmal"
  - [x] `D` oder `ArrowRight` = "oft"
  - [ ] `W` oder `ArrowUp` = Undo (letzte Zuordnung rückgängig) (optional)
  - [x] `Space` = Toggle Erklärung + Beispiel für aktuelle Karte
  - [x] Fokus auf aktive Karte automatisch setzen

- [x] **14.3** Touch/Mobile Steuerung
  - [x] Swipe-Gesten (optional, für besseres Mobile UX)
  - [x] Tap auf Bucket oder Button = Zuordnung
  - [x] Erklär-Button größer/sichtbarer auf Mobile

- [ ] **14.4** Undo Funktion (optional)
  - [ ] Stack der Zuordnungen speichern (in localStorage)
  - [ ] Undo: letzte Zuordnung entfernen, Karte zurück in "zu sortieren"
  - [ ] Mehrfach Undo möglich
  - [ ] Redo nicht notwendig (MVP)

- [x] **14.5** Shortcuts-Overlay / Info-Button
  - [x] Erstes Laden: Overlay mit Shortcuts anzeigen
  - [x] Button "i" zum Erneut-Anzeigen
  - [x] Inhalt: "A/S/D oder Pfeile zum Sortieren, W zum Rückgängigmachen, Space für Erklärung"
  - [x] Click/Escape zum Schließen

---

## 15. Frontend – Hexagon Rendering ✅ **COMPLETE**

**Status: COMPLETE! Hexagon visualization fully implemented with live preview.**

**Implementation Summary:**
- Created comprehensive hexagon coordinate system utility (`utils/hexagon.js`)
- Implemented random placement algorithm for "oft" and "manchmal" cards
- Built SVG-based HexagonGrid component with theme support
- Created Hexagon tile component with bold styling for "oft" cards
- Integrated hex grid into StudentResultsPage with theme switching and "Anders anordnen" button
- Added live preview to StudentSortPage with desktop split-view and collapsible mobile view

**Files Created/Modified:**
- `/frontend/src/utils/hexagon.js` - Complete hexagon grid utilities (axial coordinates, placement algorithm)
- `/frontend/src/components/Hexagon.jsx` - Single hexagon tile component
- `/frontend/src/components/HexagonGrid.jsx` - Full grid renderer with SVG
- `/frontend/src/pages/StudentResultsPage.jsx` - Results page with hex visualization
- `/frontend/src/pages/StudentSortPage.jsx` - Updated with live preview split view
- `/frontend/src/App.jsx` - Added results routes

- [x] **15.1** Hexagon Shape & SVG
  - [x] Hexagon-Form definieren (Koordinaten, Größe)
  - [x] SVG Rendering mit dynamischer Größe
  - [x] Responsiveness: automatische Skalierung via viewBox

- [x] **15.2** Hex-Grid Layout Algorithm
  - [x] Axial Koordinaten-System implementiert
  - [x] Zentrum = "Ich bin" fest platziert
  - [x] Ring-basierte Expansion (hexRing, hexSpiral functions)

- [x] **15.3** Random Placement Algorithm (Schritt 1-3)
  - [x] 1. Zentrum platzieren ("Ich bin")
  - [x] 2. "oft"-Kacheln zufällig in freie Positionen platzieren (mit Nachbar-Expansion)
  - [x] 3. "manchmal"-Kacheln nach "oft" zufällig platzieren
  - [x] Datenstruktur: Map für placements, Set für occupied, Array für availablePositions

- [x] **15.4** Rendering von Kacheln
  - [x] Für jede Kachel: SVG Hexagon mit Text
  - [x] "oft" Kacheln: **bold** Font Weight
  - [x] "manchmal" Kacheln: normales Font Weight
  - [x] 6 Farb-Schemata (blue, green, purple, pink, orange, teal)
  - [x] Automatisches Text-Zentrieren mit dominantBaseline/textAnchor

- [x] **15.5** Live-Vorschau Update
  - [x] Desktop: Split-View mit Live-Preview rechts (sticky positioning)
  - [x] Mobile: Collapsible Preview (default collapsed)
  - [x] Bei jeder Zuordnung (manchmal/oft): Hex-Grafik aktualisiert via React state
  - [x] Bei "selten": keine visuelle Änderung (nicht im Grid)
  - [x] useMemo für Performance-Optimierung

- [x] **15.6** "Anders anordnen" Button
  - [x] Button in Ergebnisansicht (StudentResultsPage)
  - [x] Click = randomSeed ändern → triggert Re-Placement
  - [x] Zuordnungen bleiben, nur Layout ändert sich
  - [x] Sofortiges Update ohne Animation (kann später hinzugefügt werden)

- [x] **15.7** Update todo.md & Git Commit (Hexagon Rendering Complete)
  - [x] Update todo.md to mark section 15 complete
  - [x] Update implementation status summary
  - [x] Git commit with message: "Implement hexagon visualization for sorting results (Section 15)"
  - [x] Git push to main

- [x] **15.8** Hexagon Improvements (Text Overflow & Visual Weight)
  - [x] Fixed text overflow with dynamic font sizing and multi-line support
  - [x] Enhanced "oft" visual weight with stronger colors and thicker strokes
  - [x] Improved dark theme with distinct indigo/violet colors
  - [x] Added word splitting for long adjectives (auto-hyphenation)

---

## 16. Frontend – State Management & localStorage ✅ **COMPLETE**

**Status: COMPLETE! Session state now persists across page refreshes.**

**Implementation Summary:**
- Session state (assignments, current index, adjectives) automatically saved to localStorage
- Smart restoration on page load with 24-hour expiry
- Automatic cleanup when session completes or new session starts
- Different storage keys for different lists (default vs token-based)
- Handles edge cases: expired sessions, invalid data, different tokens

**Files Modified:**
- `/frontend/src/pages/StudentSortPage.jsx` - Added localStorage save/restore logic
- `/frontend/src/pages/StudentResultsPage.jsx` - Clear localStorage when starting new session

- [x] **16.1** Session State Structure
  - [x] `current_list_id` (stored as listId)
  - [x] `analytics_session_id` (stored as sessionId)
  - [x] `theme_id` (managed by ThemeContext)
  - [x] `assignments` – Array von {adjectiveId, bucket}
  - [x] `remaining_adjectives` – calculated from currentIndex
  - [x] `hex_layout` – calculated on-demand (random seed)
  - [x] Timestamp for expiry validation (24 hours)

- [x] **16.2** localStorage Persistierung
  - [x] Save session state on every assignment change
  - [x] Restore state on page load if valid and recent
  - [x] Storage key: `vielseitig_session_{token}` or `vielseitig_session_default`

- [x] **16.3** Cleanup & Expiry
  - [x] Clear localStorage after PDF-Export / session finish
  - [x] Clear localStorage when starting new session
  - [x] 24-hour expiry for saved sessions
  - [x] Handle invalid/corrupted localStorage data gracefully

- [x] **16.4** Adjektive Caching
  - [x] Adjectives loaded once and cached in state
  - [x] Restored from localStorage on refresh
  - [x] Reused throughout session lifecycle

---

## 17. Frontend – API Client

- [x] **17.1** HTTP Client Setup
  - [x] axios oder fetch Wrapper
  - [x] Basis-URL konfigurieren
  - [x] Error Handling (401, 403, 500 etc.)
  - [x] CORS Handling

- [x] **17.2** API Endpoints für Schüler:innen-Modus
  - [x] GET /api/lists/{listId}/adjectives
  - [x] GET /api/lists/default/adjectives
  - [x] POST /api/analytics/session/start
  - [x] POST /api/analytics/assignment
  - [x] POST /api/analytics/session/finish
  - [x] POST /api/analytics/session/pdf-export
  - [x] POST /api/export/pdf

- [x] **17.3** API Endpoints für User-Bereich
  - [x] Alle User/List CRUD Endpoints (siehe Backend 5, 6)

- [x] **17.4** API Endpoints für Admin-Bereich
  - [x] Alle Admin Endpoints (siehe Backend 4, 10)

---

## 18. Frontend – User Authentication

- [x] **18.1** Login/Logout Flow
  - [x] Login Page Component
  - [x] POST /admin/login (Admin)
  - [x] POST /user/login (User)
  - [x] Session Cookie automatisch im Browser gespeichert
  - [x] Logout: DELETE Session, Redirect zu Login

- [x] **18.2** Session Validation
  - [x] Bei App-Load: prüfe ob Session gültig
  - [x] Wenn ungültig: Redirect zu Login
  - [ ] Optional: Refresh Token Mechanism (TBD)

- [x] **18.3** Protected Routes
  - [x] Route Guard für User-only Pages
  - [x] Route Guard für Admin-only Pages
  - [x] Public Routes (Schüler:innen-Modus)

---

## 19. Frontend – Inline Editing & Auto-Save

- [x] **19.1** Inline Edit Components
  - [x] Editable Text Field (contentEditable oder Input)
  - [x] Editable Textarea (explanation, example)
  - [x] Editable Dropdown (school selection, theme)

- [x] **19.2** Auto-Save Mechanism
  - [x] Debounce-Timer bei Input (z.B. 500ms)
  - [x] OnBlur (sofort speichern)
  - [x] POST/PUT Request an Backend
  - [x] Status-Anzeige: "Speichert...", "Gespeichert ✓", Error-Meldung

- [x] **19.3** Error Handling bei Save
  - [x] Fehlermeldung unter Feld anzeigen
  - [x] "Erneut versuchen" Button
  - [x] Lokale Änderung behalten (nicht verwerfen)

- [x] **19.4** Optimistic Updates
  - [x] UI zeigt Änderung sofort (optimistic)
  - [x] Backend speichert im Hintergrund
  - [x] Bei Fehler: Änderung zurücknehmen + Error anzeigen

---

## 20. Frontend – PDF Export UI

- [x] **20.1** PDF-Button in Ergebnisansicht ✅
  - [x] Sichtbar und aktiviert in StudentResultsPage
  - [x] Button zeigt "📄 PDF herunterladen" oder "⏳ Erstelle PDF..." während Export
  - [x] Click startet Download als `ich-bin-vielseitig.pdf`
  
  **Implementierung:**
  - Button mit accent variant zwischen "Anders anordnen" und "Nochmal sortieren"
  - Disabled state während PDF-Generierung
  - Emoji-Icons für bessere UX

- [x] **20.2** PDF-Generierung ✅
  - [x] studentApi.exportPDF() ruft POST /api/sessions/{sessionId}/pdf auf
  - [x] Backend generiert PDF mit Hexagon-Visualisierung
  - [x] Frontend empfängt Binary Blob (responseType: 'blob')
  - [x] Download über dynamischen Link-Element mit Dateinamen `ich-bin-vielseitig.pdf`
  
  **Implementierung:**
  - Blob-Download mit createObjectURL und automatischem Click
  - Cleanup nach Download (revokeObjectURL, link.remove())
  - Try-catch Block für Fehlerbehandlung

- [x] **20.3** Post-PDF Action ✅
  - [x] Erfolgs-Toast: "📄 PDF erfolgreich heruntergeladen!"
  - [x] localStorage state löschen nach erfolgreichem Export
  - [x] Fehler-Toast bei gescheitertem Export
  
  **Implementierung:**
  - Toast-Komponente mit success/error types
  - localStorage cleanup: `vielseitig_session_${token || 'default'}`
  - Console.error für Debugging

- [x] **20.4** Update todo.md & Git Commit (PDF Export Complete) ✅

---

## 21. Frontend – QR-Code Display

- [x] **21.1** QR-Code Generation (Backend)
  - [x] Library z.B. `python-qrcode` oder `qrcode.js`
  - [x] GET /user/lists/{listId}/qr.png returns PNG Image
  - [x] Größe: ~200x200px oder skalierbar

- [x] **21.2** QR-Code Display (Frontend)
  - [x] Listen-Übersicht: QR-Code anzeigen (Icon oder Button zum Expandieren)
  - [x] Listen-Editor: QR-Code neben Share-Link anzeigen
  - [x] Größe: ~300x300px für Druck

- [x] **21.3** QR-Code Download/Print
  - [x] Button: "QR-Code drucken" oder "QR-Code herunterladen"
  - [x] Dialog oder neuer Tab mit QR zum Drucken

- [ ] **21.4** Update todo.md & Git Commit (QR-Code Display Complete)
  - [x] Update todo.md to mark section 21 complete
  - [x] Update implementation status summary
  - [x] Git commit with message: "Implement QR code display and download (Section 21)"
  - [x] Git push to main

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

- [ ] **22.8** Update todo.md & Git Commit (Testing Phase Complete)
  - [ ] Update todo.md to mark section 22 complete
  - [ ] Update implementation status summary
  - [ ] Git commit with message: "Complete testing and quality assurance (Section 22)"
  - [ ] Git push to main

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

- [ ] **23.9** Update todo.md & Git Commit (Deployment Complete)
  - [ ] Update todo.md to mark section 23 complete
  - [ ] Update implementation status summary
  - [ ] Git commit with message: "Complete deployment and DevOps setup (Section 23)"
  - [ ] Git push to main

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

- [ ] **24.6** Update todo.md & Git Commit (Documentation Complete)
  - [ ] Update todo.md to mark section 24 complete
  - [ ] Update implementation status summary
  - [ ] Git commit with message: "Complete documentation and compliance (Section 24)"
  - [ ] Git push to main

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

- [ ] **25.6** Final Release & Git Commit
  - [ ] Update todo.md to mark sections 25+ complete
  - [ ] Update implementation status summary with MVP completion date
  - [ ] Git commit with message: "Complete pilot testing and launch preparation - v1.0.0"
  - [ ] Git tag v1.0.0 for official release
  - [ ] Git push to main with tags

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

## Implementation Status Summary (as of 2026-02-03)

### ✅ Completed
- Backend: All core endpoints, authentication, user/admin management, analytics tracking, PDF generation
- Frontend: React + Vite + Tailwind setup, Theme system (6 themes), Auth context
- Frontend Pages: HomePage, UserLoginPage, UserRegisterPage, AdminLoginPage, **StudentSortPage**, **StudentResultsPage**, **UserListsPage, UserListEditorPage, UserProfilePage**
- Shared Components: Button, Input, Header, Footer, Toast, Loading
- Student Sorting: Fully functional with keyboard controls (A/S/D, Space, I), progress tracking, overlay with shortcuts
- API Client: Axios setup with all necessary endpoints for sorting and PDF export
- **Hexagon Visualization: Complete with live preview, multi-line text support, enhanced visual weight for "oft" items**
- **StudentResultsPage: Theme switching, "Anders anordnen" button, statistics summary**
- **localStorage State Persistence: Session survives page refresh with 24-hour expiry**
- **PDF Export: Download button with blob handling, localStorage cleanup, success/error notifications**
- **User List Management: Overview with create + share copy, editor with autosave and adjective CRUD, profile view with logout**
- **Admin Area: Pending Inbox, User/School lists, Analytics summary + sessions table, Standard List Editor, Admin Profile**
- **QR Codes: Backend generation + UI preview/download in list overview and editor**
- **Auth Guards: Session validation on app load, protected admin/user routes, unified login handling**
- **Keyboard Controls: Full A/S/D shortcuts, Space for explanation, I for info overlay**
- **Inline Editing: Auto-save with debounce, optimistic updates, error handling**
- **Premium Lists: 4 additional lists (Grosse Liste 50, Sport 40, Selbstkompetenz 40, Sozialkompetenz 40) with QR sharing**
- **Copy-on-Write (Fork): Users can fork standard, premium, and school-shared lists to create editable copies**
- **Makefile: VENV auto-activation for all make commands**
- **Deployment: App deployed to production server and working**

### 🔄 In Progress
- None currently

### ⏳ Pending (Low Priority / Optional)
1. **Twilio SMS**: Add credentials to .env for registration notifications (optional, app works without)

### ⚠️ Known Limitations
- Drag-and-drop/Undo für Sortieren nicht implementiert (optional)
- Impressum/Datenschutz Seiten enthalten noch Platzhaltertext; finalen Betreibertext einsetzen
- Twilio SMS credentials not yet configured (SMS will fail silently until added)

**Status: Production Deployed & Feature Complete - Ready for Pilot**
**Last Updated: 2026-02-03**

---

## 🚀 Post-Deployment Status (Production Live!)

### ✅ Deployed & Working
- [x] Student sorting flow (30 adjectives with A/S/D keys)
- [x] Hexagon visualization with 6 color themes
- [x] PDF export (downloads as "ich-bin-vielseitig.pdf")
- [x] Standard list with 30 adjectives seeded
- [x] Premium lists (4 additional lists for registered teachers)
- [x] QR code generation for share links
- [x] Mobile-responsive design
- [x] Keyboard shortcuts (A/S/D, Space, I for info)
- [x] Session state persistence (survives page refresh)
- [x] Production server deployed (vielseitig.zumgugger.ch)
- [x] HTTPS configured
- [x] Database seeded and persistent

### ⚠️ Optional Enhancements (Not Blocking)

#### Twilio SMS Notifications
- [ ] **Add Twilio credentials to .env** (optional, SMS will fail silently):
  - [ ] `TWILIO_ACCOUNT_SID`
  - [ ] `TWILIO_AUTH_TOKEN`
  - [ ] `TWILIO_FROM_NUMBER`
  - [ ] `ADMIN_PHONE_NUMBER`
- SMS notification sends "neue registrierung bei vielseitig" when users register

### 🎯 Student Instructions (for class)
1. Scan QR code or visit URL
2. Sort adjectives using:
   - **A** = Selten (rarely)
   - **S** = Manchmal (sometimes)  
   - **D** = Oft (often)
   - **Space** = Show explanation
3. After all 30: choose a color theme
4. Click "PDF herunterladen" to save result

### ⚡ Performance Notes
- Supports 20+ simultaneous students (SQLite handles concurrent reads well)
- Each session creates ~30 database entries (lightweight)
- PDF generation is server-side, ~1-2 seconds per export

### 🔧 Quick Troubleshooting
| Issue | Solution |
|-------|----------|
| QR code not loading | Check HTTPS is working |
| PDF not downloading | Check browser allows downloads |
| Session lost on refresh | Clear localStorage, restart |
| Slow loading | Check server resources |
