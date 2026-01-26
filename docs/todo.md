# Vielseitig – Todo Liste

*Basierend auf Spezifikation vom 26.01.2026*

---

## 1. Projekt-Setup & Infrastructure

- [ ] **1.0** Development Environment Setup
  - [x] WSL als Standard-Terminal in VS Code konfigurieren
  - [x] Python Virtual Environment (.venv) in WSL erstellen
  - [x] pip in .venv installieren
  - [x] .gitignore Datei erstellen
  - [ ] Sicherstellen dass alle Python-Commands in .venv ausgeführt werden
  - [ ] requirements.txt erstellen
  - [ ] Basis-Dependencies installieren (Flask/FastAPI, SQLAlchemy, etc.)

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

- [ ] **2.1** SQLite Schema implementieren
  - [ ] Tabelle `schools` (id, name, status, created_at)
  - [ ] Tabelle `users` (id, email, password_hash, school_id, status, active_until, created_at, last_login_at, notes)
  - [ ] Tabelle `admins` (id, username, password_hash, created_at, last_login_at)
  - [ ] Tabelle `lists` (id, name, description, is_default, owner_user_id, share_token, share_expires_at, share_enabled, share_with_school, source_list_id, created_at, updated_at)
  - [ ] Tabelle `adjectives` (id, list_id, word, explanation, example, order_index, active)
  - [ ] Tabelle `analytics_sessions` (id/uuid, list_id, is_standard_list, theme_id, started_at, finished_at, pdf_exported_at)
  - [ ] Tabelle `analytics_assignments` (id, session_id, adjective_id, bucket, assigned_at)

- [ ] **2.2** Seed-Daten für Standardliste
  - [ ] 30 Adjektive (aus Spec 5.2.2) in SQL INSERT Scripts
  - [ ] Seed-Script idempotent machen (keine Duplikate)
  - [ ] Standardliste als `is_default=true`, `owner_user_id=NULL`

- [ ] **2.3** Indizes & Constraints
  - [ ] Unique Index auf `users.email`
  - [ ] Unique Index auf `schools.name`
  - [ ] Foreign Keys: `users.school_id` → `schools.id`
  - [ ] Foreign Keys: `lists.owner_user_id` → `users.id` (nullable)
  - [ ] Foreign Keys: `adjectives.list_id` → `lists.id`
  - [ ] Foreign Keys: `analytics_sessions.list_id` → `lists.id` (nullable)

---

## 3. Backend – Authentication & Authorization

- [ ] **3.1** Passwort-Hashing & Validierung
  - [ ] bcrypt oder Argon2 Integration
  - [ ] Passwort-Hashing bei User-Registrierung
  - [ ] Passwort-Validierung bei Login
  - [ ] Passwort-Strength Anforderungen definieren

- [ ] **3.2** Admin-Login Endpoint
  - [ ] POST `/admin/login` (username, password)
  - [ ] Admin-Session anlegen
  - [ ] Admin-Session Cookies/Tokens (httpOnly, Secure)
  - [ ] Admin-Logout Endpoint

- [ ] **3.3** Admin Session Management
  - [ ] Session Timeout nach 2 Tagen Inaktivität (Sliding)
  - [ ] Session-Store (DB oder Redis)
  - [ ] Middleware für Admin-Auth Überprüfung

- [ ] **3.4** User-Login Endpoint
  - [ ] POST `/user/login` (email, password)
  - [ ] User-Session anlegen
  - [ ] User-Session Cookies/Tokens (httpOnly, Secure)
  - [ ] User-Logout Endpoint

- [ ] **3.5** User-Registrierung Endpoint
  - [ ] POST `/user/register` (email, password, school_id/school_name)
  - [ ] School-Validierung (existierend oder neu)
  - [ ] Status auf `pending` setzen
  - [ ] Neue School als `pending` anlegen, wenn nicht existiert
  - [ ] **SMS an Admin senden** (siehe Twilio Integration 3.9)
  - [ ] Registrierungs-Email-Bestätigung TBD (für MVP wahrscheinlich nicht)

- [ ] **3.6** Authorization Middleware
  - [ ] Admin-only Routes schützen
  - [ ] User-only Routes schützen
  - [ ] Public Routes (Schüler:innen-Modus, Standard-Liste)
  - [ ] Share-Token Validation für Custom-Listen

- [ ] **3.7** Schul-Lizenz-Check
  - [ ] Funktion: prüfe ob Schule lizenziert ist (mind. 1 aktiver User)
  - [ ] Alle Users einer lizenzierten Schule als automatisch aktiv behandeln
  - [ ] PDF-Export freigeben wenn Schule lizenziert oder Custom-Liste vom aktiven User

- [ ] **3.8** Passwort-Reset (Admin-only)
  - [ ] Admin kann Benutzer-Passwort zurücksetzen
  - [ ] PUT/POST `/admin/users/{userId}/reset-password`
  - [ ] Neues Passwort generieren oder Admin setzt es manuell

- [ ] **3.9** Twilio SMS Integration
  - [ ] Environment Variables laden (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, ADMIN_PHONE_NUMBER)
  - [ ] SMS-Funktion: "neue registrierung bei vielseitig" senden
  - [ ] Trigger bei User-Registrierung
  - [ ] Error Handling & Fallback (nur Log + Backend-Hinweis, kein Block)

---

## 4. Backend – User-Management (Admin)

- [ ] **4.1** Pending Inbox Endpoints
  - [ ] GET `/admin/pending-users` – Liste ausstehender User
  - [ ] POST `/admin/users/{userId}/approve` – User aktivieren (status=active)
  - [ ] POST `/admin/users/{userId}/reject` – User ablehnen
  - [ ] GET `/admin/pending-schools` – Liste ausstehender Schulen
  - [ ] POST `/admin/schools/{schoolId}/approve` – Schule aktivieren
  - [ ] POST `/admin/schools/{schoolId}/reject` – Schule ablehnen

- [ ] **4.2** User CRUD (Admin)
  - [ ] GET `/admin/users` – alle User
  - [ ] GET `/admin/users/{userId}` – Einzelheiten
  - [ ] POST `/admin/users` – neuen User anlegen
  - [ ] PUT `/admin/users/{userId}` – User bearbeiten
  - [ ] DELETE `/admin/users/{userId}` – User löschen
  - [ ] PUT `/admin/users/{userId}/activation` – status/active_until setzen

- [ ] **4.3** School CRUD (Admin)
  - [ ] GET `/admin/schools` – alle Schulen
  - [ ] POST `/admin/schools` – neue Schule anlegen
  - [ ] PUT `/admin/schools/{schoolId}` – Schule bearbeiten
  - [ ] DELETE `/admin/schools/{schoolId}` – Schule löschen

- [ ] **4.4** Admin Notes & Comments
  - [ ] User-Feld `notes`/`admin_comment` editierbar
  - [ ] Ansicht in Admin-Verwaltung

---

## 5. Backend – User-Management (Lehrkraft)

- [ ] **5.1** User-Profil Endpoint
  - [ ] GET `/user/profile` – aktuelle User-Infos
  - [ ] PUT `/user/profile` – Passwort ändern o.ä.
  - [ ] GET `/user/schools` – eigene Schule

- [ ] **5.2** Listen-Übersicht Endpoint
  - [ ] GET `/user/lists` – Standardliste + eigene Custom-Listen + schul-geteilte Listen
  - [ ] Filter nach `is_default`, `owner_user_id`, `share_with_school`

---

## 6. Backend – Listen-Verwaltung

- [ ] **6.1** List CRUD (User)
  - [ ] POST `/user/lists` – neue Custom-Liste anlegen
  - [ ] GET `/user/lists/{listId}` – Liste + Adjektive
  - [ ] PUT `/user/lists/{listId}` – Liste bearbeiten (name, description, share_with_school)
  - [ ] DELETE `/user/lists/{listId}` – Liste löschen (nur eigene)

- [ ] **6.2** Share-Token Generation
  - [ ] Kryptographisch zufälliger Token generieren (z.B. `secrets.token_urlsafe()` Python)
  - [ ] Token in `lists.share_token` speichern
  - [ ] URL-Format: `/l/{token}`
  - [ ] Gültigkeit: 1 Jahr von Erstellung (in `share_expires_at`)

- [ ] **6.3** Adjektiv CRUD (User, Inline Editing)
  - [ ] GET `/user/lists/{listId}/adjectives` – alle Adjektive einer Liste
  - [ ] POST `/user/lists/{listId}/adjectives` – neues Adjektiv hinzufügen
  - [ ] PUT `/user/lists/{listId}/adjectives/{adjectiveId}` – Adjektiv bearbeiten (word, explanation, example, order_index)
  - [ ] DELETE `/user/lists/{listId}/adjectives/{adjectiveId}` – Adjektiv löschen
  - [ ] Berechtigungsprüfung: nur Owner oder Schul-Admin

- [ ] **6.4** Copy-on-Write für Schul-geteilte Listen
  - [ ] Wenn User eine schul-geteilte Liste bearbeitet, automatisch Fork erstellen
  - [ ] Fork ist neue private Liste mit `source_list_id` = Original
  - [ ] Fork wird standardmäßig auch mit Schule geteilt (`share_with_school=true`)
  - [ ] UI-Hinweis: "Du bearbeitest eine Kopie"
  - [ ] Original-Liste bleibt unverändert

- [ ] **6.5** Standardliste (Admin-only Editing)
  - [ ] GET `/admin/standard-list` – Standardliste + Adjektive
  - [ ] PUT `/admin/standard-list/{adjectiveId}` – Adjektiv bearbeiten (Inline Auto-Save)
  - [ ] DELETE `/admin/standard-list/{adjectiveId}` – Adjektiv aus Standard-Liste entfernen
  - [ ] Daten geben auch an Frontend (für Inline Editing)

---

## 7. Backend – Share-Links & Public Access

- [ ] **7.1** Share-Link Resolution
  - [ ] GET `/l/{token}` – Redirect zu Schüler:innen-Sortieransicht
  - [ ] Token validieren (existiert, nicht abgelaufen)
  - [ ] Ggf. Owner-User prüfen (aktiv? Schule lizenziert?)
  - [ ] Public Standard-Liste: GET `/` – Redirect zu Schüler:innen-Sortieransicht

- [ ] **7.2** QR-Code Generation
  - [ ] QR-Code für Share-Links generieren
  - [ ] QR-Code als PNG/SVG
  - [ ] Endpoint: GET `/user/lists/{listId}/qr` oder GET `/user/lists/{listId}/qr.png`

---

## 8. Backend – Schüler:innen-Modus (Sortieren)

- [ ] **8.1** Adjektiv-Abruf für Session
  - [ ] GET `/api/lists/{listId}/adjectives` – alle Adjektive als JSON
  - [ ] Oder GET `/api/lists/default/adjectives` für Standardliste
  - [ ] Format: `[{id, word, explanation, example, ...}]`
  - [ ] Randomize (Shuffle) optional im Frontend oder Backend?

- [ ] **8.2** Analytics Session Start
  - [ ] POST `/api/analytics/session/start` – neue Session anlegen
  - [ ] Parameter: `list_id` (nullable für Standard), `theme_id` (welches Theme gewählt)
  - [ ] Returns: `analytics_session_id` (uuid)
  - [ ] Speichere `started_at`, `is_standard_list` Flag

- [ ] **8.3** Analytics Assignment Tracking
  - [ ] POST `/api/analytics/assignment` – Adjektiv einer Kategorie zuordnen
  - [ ] Parameter: `analytics_session_id`, `adjective_id`, `bucket` (selten/manchmal/oft)
  - [ ] Speichere `assigned_at` Timestamp

- [ ] **8.4** Analytics Session Finish
  - [ ] POST `/api/analytics/session/finish` – Session abschließen
  - [ ] Parameter: `analytics_session_id`
  - [ ] Speichere `finished_at` Timestamp

- [ ] **8.5** PDF-Export Flag
  - [ ] POST `/api/analytics/session/pdf-export` – PDF wurde exportiert
  - [ ] Parameter: `analytics_session_id`
  - [ ] Speichere `pdf_exported_at` Timestamp
  - [ ] Lösche Session-State aus `localStorage` (Backend-Signal für Frontend)

---

## 9. Backend – PDF-Export

- [ ] **9.1** PDF-Generierung
  - [ ] Hexagon-Koordinaten berechnen (Zentrum + Ringe für "oft" + "manchmal")
  - [ ] Random-Layout Algorithmus implementieren (siehe Spec 7.1-7.1.1)
  - [ ] Hexagon-Kacheln rendern (PyPDF2, reportlab, oder externe Library wie weasyprint/wkhtmltopdf)
  - [ ] Farb-Schemas definieren (6 Themes, hardcoded)
  - [ ] Theme-Styling anwenden

- [ ] **9.2** PDF-Layout
  - [ ] A4 Hochformat
  - [ ] Zentrum: "Ich bin"
  - [ ] "oft"-Kacheln: **bold**, zuerst platziert
  - [ ] "manchmal"-Kacheln: normal, danach platziert
  - [ ] "selten" nicht anzeigen
  - [ ] Datum unten (Formatierung: `26.01.2026`)
  - [ ] Kein Schullogo/Branding

- [ ] **9.3** PDF Endpoint
  - [ ] POST `/api/export/pdf` – PDF generieren & downloaden
  - [ ] Parameter: `assignments` (Liste von {adjective_id, bucket}), `theme_id`
  - [ ] Validierung: ist PDF-Export erlaubt? (Standard-Liste ohne Lizenz → nein; Custom-Liste → ja wenn Owner aktiv)
  - [ ] Returns: PDF Binary mit `Content-Type: application/pdf`
  - [ ] Filename: `ich-bin-vielseitig.pdf`

---

## 10. Backend – Analytics & Admin Dashboard

- [ ] **10.1** Analytics Aggregations
  - [ ] Gesamtzahl Sessions (zähle `analytics_sessions` Einträge)
  - [ ] Durchschnittliche Dauer: (sum(`finished_at` - `started_at`) / count)
  - [ ] Top Adjektive in Bucket "oft": zähle Vorkommen in `analytics_assignments` mit `bucket='oft'`, sortiere absteigend
  - [ ] PDF-Exporte gesamt: zähle Einträge mit `pdf_exported_at` NOT NULL
  - [ ] Theme-Verteilung: zähle Sessions pro `theme_id`

- [ ] **10.2** Admin Dashboard API
  - [ ] GET `/admin/analytics/summary` – returns JSON mit Aggregations-Daten
  - [ ] Format: `{total_sessions, avg_duration_seconds, top_adjectives, total_pdfs, theme_distribution}`

- [ ] **10.3** Analytics Retention Policy
  - [ ] TBD: Cleanups nach X Monaten (z.B. 12 Monate) durchführen
  - [ ] Optional: Daily Rollups-Tabelle für Performance

---

## 11. Frontend – Struktur & Tech-Stack

- [ ] **11.1** Frontend Framework Auswahl
  - [ ] React, Vue, oder Vanilla JS + Framework?
  - [ ] Build-Tool: Webpack, Vite, Create React App?
  - [ ] CSS Framework oder CSS-in-JS?
  - [ ] Vorschlag: React + Vite + Tailwind CSS (oder ähnlich)

- [ ] **11.2** Frontend Folder Structure
  - [ ] `src/pages/` – Page Components
  - [ ] `src/components/` – Reusable Components
  - [ ] `src/hooks/` – Custom React Hooks (falls React)
  - [ ] `src/api/` – API Client Functions
  - [ ] `src/store/` – State Management (Context API, Redux, Zustand)
  - [ ] `src/styles/` – Global Styles, Themes
  - [ ] `src/utils/` – Utilities (random, validation, etc.)
  - [ ] `src/assets/` – Images, Icons, Fonts

- [ ] **11.3** Build & Development Setup
  - [ ] `package.json` mit Dependencies
  - [ ] Dev Server starten (z.B. `npm run dev`)
  - [ ] Build Script (`npm run build`)
  - [ ] Environment Variables (.env files)

---

## 12. Frontend – Styles & Farbschemas

- [ ] **12.1** Global Styles & Reset
  - [ ] CSS Reset / Normalize
  - [ ] Global Font-Familie + Größen
  - [ ] Breakpoints für Responsive Design (Desktop: 900px+, Mobile: <900px)

- [ ] **12.2** Theme System
  - [ ] 6 vordefinierte Farbschemas (hardcoded)
  - [ ] Theme-Objekt: `{name, bgColor, cardFillColor, cardBorderColor, textColor, boldTextColor, accentColor, ...}`
  - [ ] Theme Provider / Context
  - [ ] Theme Selection & localStorage Persistierung
  - [ ] CSS Variables oder CSS-in-JS für Dynamic Styling

- [ ] **12.3** Hexagon Styling
  - [ ] Hexagon Shape (CSS oder SVG)
  - [ ] Hexagon Grid Layout
  - [ ] Hover/Focus States
  - [ ] Animation: smooth "Anheften" der Kachel (optional, respektiere `prefers-reduced-motion`)

- [ ] **12.4** Barrierefreiheit (a11y)
  - [ ] Farb-Kontrast (WCAG AA mindestens)
  - [ ] Schriftgrößen >= 16px (Mobile) / 14px (Desktop)
  - [ ] Einfache deutsche Sprache
  - [ ] ARIA Labels für Icons/Buttons
  - [ ] Tastatur-Navigation testen

---

## 13. Frontend – Layout & Pages

- [ ] **13.1** Layout Component
  - [ ] Header mit Navigation (Schüler:innen-Modus vs. User-Bereich vs. Admin-Bereich)
  - [ ] Footer mit Links (Impressum, Datenschutz)
  - [ ] Responsive Grid Layout (Split-Screen Desktop / Stacked Mobile)

- [ ] **13.2** Schüler:innen-Modus Main Page
  - [ ] Landing Page (Start ohne Intro)
  - [ ] Oder direkt in Sortieransicht?
  - [ ] Link: "Anmelden als Lehrperson" (zu Login/Registrierung)

- [ ] **13.3** Sortieransicht Page (`/sort` oder `/l/{token}`)
  - [ ] Aktive Karte (Adjektiv groß, zentral)
  - [ ] 3 Buckets: "selten", "manchmal", "oft" (Zielflächen)
  - [ ] Fortschritt anzeigen: `3/30`
  - [ ] Info-Button ("i") mit Shortcuts-Overlay
  - [ ] Erklär-Button neben Karte (toggle Erklärung + Beispiel)
  - [ ] Leertaste Toggle Erklärung

- [ ] **13.4** Bestätigungs-Ansicht
  - [ ] "Fortfahren, falls du mit der Zuordnung zufrieden bist"
  - [ ] Button: "Fortfahren" → Ergebnisansicht
  - [ ] Optional: Undo möglich?

- [ ] **13.5** Ergebnisansicht Page
  - [ ] Hexagon-Visualisierung (volles Rendering)
  - [ ] Button: "Anders anordnen" (re-layout)
  - [ ] Button: "PDF Export / Drucken" (siehe Bedingungen)
  - [ ] Dropdown: Theme-Auswahl
  - [ ] Responsive: auf Mobile Hex-Grafik einklappbar
  - [ ] Kein "Zurück" zum Sortieren

- [ ] **13.6** User-Login Page (`/user/login`)
  - [ ] Email Input
  - [ ] Passwort Input
  - [ ] Login Button
  - [ ] Link zur Registrierung

- [ ] **13.7** User-Registrierung Page (`/user/register`)
  - [ ] Email Input
  - [ ] Passwort Input
  - [ ] Passwort-Wiederholen Input
  - [ ] School Dropdown (existierende Schulen)
  - [ ] "Neue Schule hinzufügen" Option
  - [ ] Registrieren Button
  - [ ] SMS an Admin wird gesendet (User sieht Bestätigung: "Anfrage eingegangen, Admin wird benachrichtigt")

- [ ] **13.8** User-Bereich: Listen-Übersicht Page (`/user/lists`)
  - [ ] Tabelle/Karten-Ansicht mit:
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

---

## 22. Testing & Quality Assurance

- [ ] **22.1** Backend Unit Tests
  - [ ] Auth-Funktionen testen (Login, Passwort-Hash, Session)
  - [ ] Database-Operationen testen (CRUD)
  - [ ] Business Logic testen (Schul-Lizenz, Share-Token, Analytics)
  - [ ] API Endpoint Tests (200, 401, 403, 400 Responses)

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
