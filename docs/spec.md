# Spezifikation: "Ich bin" Adjektiv-Sortier-Tool (DE)

## 1. Ziel & Zielgruppe
- **Ziel**: Schüler:innen (12–15) unterstützen, sich über Adjektive zu reflektieren und eine persönliche Auswahl zu visualisieren.
- **Zielgruppe**: 12–15 Jahre, Deutsch.
- **Kontext**: Unterricht / Schulsozialarbeit / Selbstreflexion. (TBD)

## 2. Plattform & Rahmenbedingungen (TBD)
- **Plattform**: **Web-App im Browser** (Zielgerät: **Chromebooks** der Schüler:innen)
- **Responsive**: Desktop/Chromebook bevorzugt, aber **Mobile View wird unterstützt** (siehe Layout-Regeln in 6.2.1).
- **Offline-Fähigkeit**: **nicht erforderlich** (online-only)
- **Account/Anmeldung**:
  - **Schüler:innen-Modus**: **kein Login / keine Registrierung** (Zugriff über Standardliste oder Link/QR)
  - **User-Modus**: **Login erforderlich** (User verwalten eigene Custom-Listen)
    - **Registrierung**: User können sich **selbst registrieren**, müssen aber durch den Admin **freigeschaltet** werden.
  - **Admin-Modus** (Superadmin): **Login erforderlich** (verwaltet User-Konten, Freischaltung)
- **Datenspeicherung**:
  - **Inhalte (Adjektiv-Listen + Texte)** werden **persistent** gespeichert in **SQLite**
  - **Schüler:innen-Ergebnisse**: **keine Speicherung/Historie über Sitzungen hinweg**; Zustand nur für die aktuelle Sitzung (siehe Export). **Undo innerhalb der Sitzung** ist erlaubt (siehe Interaktion).
  - TBD: ob Session-State lokal (z. B. im Browser) gespeichert wird oder nur im Speicher.

## 2.3 Produktmodell (Pilot / Monetarisierung-Vorbereitung)
- **Öffentlich & gratis**: Standardliste ist ohne Login nutzbar (über die Domain).
- **Einschränkung**: In der öffentlichen Standardliste ist **kein PDF-Export/Drucken** verfügbar.
- **Aktive Users**: können Custom-Listen erstellen, Share-Links/QR-Codes verteilen und für Sessions aus Custom-Listen **PDF erzeugen**.
- **Passive Users**: haben **keinen Vorteil** (keine Verwaltung, keine PDF-Exports). Später vorgesehen: Reaktivierung nach Zahlung.

### 2.3.2 Schul-Lizenz (neu)
- Konzept: Eine Schule gilt als **lizenziert**, sobald **mindestens ein User** dieser Schule **aktiv** ist.
- Wirkung (festgelegt): Sobald eine Schule lizenziert ist, sind **automatisch alle Users dieser Schule aktiv** (Login + QR/Share + PDF-Funktionalität).
- Konsequenz: Aktivierung ist effektiv **schulweit**, nicht individuell.

### 2.3.1 Lizenzierung / Aktivierung (Empfehlung)
- **MVP/Pilot (empfohlen)**: Lizenzierung ist **manuell**.
  - Du legst einen **User** an (oder der Admin legt ihn an) und setzt `status=active` sowie optional `active_until`.
  - Kein Payment-Flow im MVP.
- **Später (TBD)**: Self-Serve Lizenzierung
  - Option A: **Lizenz-Code/Key** (z. B. 1 Jahr gültig) im User-Bereich eingeben → setzt `active_until`
  - Option B: Payment (z. B. Stripe) → automatische Aktivierung/Verlängerung

## 2.1 Hosting & Deployment
- Hosting: eigener **Ubuntu-Server**
- Deployment: **Docker Compose**
- Webserver davor: **Apache2** als VirtualHost
- Domain: **vielseitig.zumgugger.ch**
- Transport Security: **HTTPS für die komplette Seite** (Let's Encrypt)
- Datenablage: **SQLite DB-Datei** liegt persistent in einem Ordner auf dem Server (Docker Volume/Bind Mount)
- TBD: Apache-Konfiguration (Reverse Proxy auf App-Container vs. statische Dateien + API separat)

## 2.2 Security (MVP)
- Admin/User-Bereich: Schutz **nur über App-Login (Benutzername/Passwort)**
- Keine zusätzlichen Maßnahmen wie IP-Whitelist oder HTTP Basic Auth vorgesehen
- Login-Session läuft automatisch nach **2 Tagen** ab (TBD: Inaktivität vs. absolute Dauer).
- Session-Timeout ist **sliding**: Ablauf nach **2 Tagen Inaktivität**.
- Passwort-Reset: keine „Passwort vergessen“ Mail (kein Mailserver); Reset erfolgt durch **Admin im Backend**.

## 2.6 Rechtliches
- Die App enthält verlinkte Seiten:
  - **Impressum**
  - **Datenschutzerklärung**
- Datenschutzhinweis (Kernbotschaft): Von **Schüler:innen** werden **keine personenbezogenen Daten gespeichert**; Ergebnisse werden nicht serverseitig persistiert (nur PDF-Download lokal).
- TBD: Inhalte/Template für Impressum & Datenschutzerklärung (Betreiber liefert Text).

### 2.6.1 Datensparsamkeit (festgelegt)
- Gespeicherte Daten für **Users (Lehrpersonen)**:
  - **E-Mail** (Login)
  - **Schule** (Referenz auf `schools`)
  - **Passwort-Hash** (kein Klartext)
- Keine Speicherung von Schüler:innen-Daten.
- Logging: **keine IP-Adress-Logs** im MVP (nur technische Minimal-Logs auf Serverebene, TBD).
- Schüler:innen-Modus: **ohne Cookies** (Session nur via `localStorage`).
- Analytics: nur anonym/aggregiert, keine IPs, keine personenbezogenen Daten (Details siehe 2.7).

## 2.7 Statistik / Analytics (neu)
Ziele:
- Anzahl Nutzungen (**Sessions**)
- Häufigkeit, wie oft jedes **Adjektiv** in **selten/manchmal/oft** landet
- Zeitdauer von **erstem Adjektiv** bis **Ergebnisansicht**
- Anzahl **PDF-Exporte**
- Anzahl PDF-Exporte **pro Theme**
### 2.7.1 Admin Dashboard (MVP Minimalumfang)
- Gesamtzahl Sessions
- Durchschnittliche Dauer (Start → Ergebnisansicht)
- Top Adjektive in Bucket **„oft“**
- PDF-Exporte gesamt
- Theme-Verteilung der PDF-Exporte

Hinweis: Dashboard ist **nur Anzeige im Browser** (kein CSV-Export im MVP).


Scope:
- Auswertung ist **global** (keine Auswertung pro Schule, keine personenbezogene Zuordnung).

Constraints (Privacy):
- Keine Cookies im Schüler:innen-Modus.
- Keine Speicherung von IP-Adressen in der App.
- Keine Speicherung von Schüler:innen-Identitäten.

Technik-Vorschlag (MVP):
- Pro Durchlauf wird eine zufällige `analytics_session_id` erzeugt und in `localStorage` gehalten (pseudonym, nicht personalisiert).
- Events werden serverseitig gespeichert, aber **nur** mit:
  - `analytics_session_id`
  - Flag Standardliste vs. Custom-Liste (global; keine per-Schule Auswertung)
  - `adjective_id` + Bucket (selten/manchmal/oft)
  - Timestamps (Start/Finish)
  - `theme_id`
  - `exported_pdf` (ja/nein)
- Der lokale Stand wird nach PDF-Export gelöscht (damit endet auch die Session).
- TBD: Retention der Analytics-Daten (z. B. 12 Monate) und reine Aggregation (optional Daily Rollups).
- Später (TBD): Zahlungs-/Lizenzdaten **anonymisiert nur pro Schule** (keine personenbezogenen Zahlungsdaten).

## 2.4 Benachrichtigungen (SMS)
- Bei **neuer Registrierung** erhält der Admin eine **SMS**.
  - Trigger: neue **User-Registrierung** und/oder neue **Schule (pending)**
- Pro Registrierung wird **genau 1 SMS** gesendet.
- SMS-Text (MVP): **„neue registrierung bei vielseitig“**
- SMS dient als Hinweis, damit Admin zeitnah freischalten kann.
- SMS-Zugangsdaten werden **nicht** in der App erfasst, sondern beim Deploy als **Environment Variables** gesetzt (Docker Compose).
- Provider: **Twilio** (bereits vorhanden; vorhandene Nummer kann wiederverwendet werden)
- ENV Konfiguration (Vorschlag):
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_FROM_NUMBER` (oder alternativ Messaging Service SID)
  - `ADMIN_PHONE_NUMBER` (Empfänger)
- Fallback bei SMS-Fehler: TBD (z. B. nur Log-Eintrag + Hinweis im Admin-Backend)

## 2.5 Spätere Integrationen (Notiz)
- Später gewünschte Erweiterung: Bei neuer Registrierung automatisch ein **Todo** im privaten Todo-System des Betreibers anlegen.
- Voraussetzung: Todo-App braucht dafür eine **JSON API** (noch zu bauen).

## 3. Kernkonzept
Schüler:innen erhalten Adjektive (jeweils mit kurzer Erklärung + Beispiel) und sortieren diese in drei Kategorien:
- **selten**
- **manchmal**
- **oft**

Am Ende wird eine grafische Darstellung aus **hexagonalen Kacheln** erzeugt:
- In der Mitte: **"Ich bin"**-Karte
- **"oft"**-Karten sind **fett/bold** und werden zuerst platziert (siehe Random-Layout)
- **"manchmal"**-Karten werden danach platziert (siehe Random-Layout)
- **"selten"** erscheint **nicht** in der Darstellung

Hinweis: Zentrum bleibt im MVP bei **„Ich bin“** (kein „Ich möchte sein“ im Moment).

## 4. Nutzerfluss (TBD Details)
1. **Direktstart**: App startet ohne Intro direkt mit der ersten Karte.
  - Kurzer Hinweistext: „Ordne die Eigenschaft zu.“
  - Shortcuts-Hinweis: beim ersten Start als **Overlay**; danach klappt es zu einem kleinen **„i“** ein.
    - Hover auf „i“ zeigt die Hilfe wieder an.
    - Inhalt (kurz, TBD genaue Formulierung): `A/S/D` bzw. Pfeile + `W` (Undo) + `Leertaste` (Erklärung)
  - Link: **„Anmelden als Lehrperson“** (führt zu einer kombinierten Seite: Login + Registrieren)
  - Pfad/URL-Struktur des Lehrpersonen-Bereichs ist **nicht festgelegt** (egal), solange funktional sauber getrennt.
2. **Liste öffnen**:
  - **Default (öffentlich)**: Zugriff ohne speziellen Link öffnet die **Standardliste**
  - **Custom-Liste**: Zugriff über **Link oder QR-Code** (vom User bereitgestellt)
3. Sortieransicht: Adjektiv-Karten lesen und in Bucket ziehen/tippen
4. Review/Ändern (TBD)
5. Ergebnisansicht: Hex-Visual + Druck/Export

### 4.2 Fortschritt & Abschluss (festgelegt)
- Während des Sortierens wird ein sehr einfacher Fortschritt angezeigt, z. B. **`3/30`** (zugeordnet / total).
- Wenn alle Adjektive zugeordnet sind, erscheint eine **Bestätigungs-Ansicht**:
  - Hinweis: „Fortfahren, falls du mit der Zuordnung zufrieden bist.“
  - Aktionen: **Fortfahren** (→ Ergebnisansicht)
- Danach wechselt die App in die **Ergebnisansicht**.
- Ergebnisansicht bietet:
  - Button **„Anders anordnen“** (Layout neu auslosen, Zuordnungen bleiben)
  - **PDF Export/Print** (Download des PDFs) **nur wenn Export erlaubt ist** (siehe Export-Regeln)
  - Theme-Auswahl (Dropdown): Theme kann in der Ergebnisansicht noch gewechselt werden und beeinflusst das PDF
- Ergebnisansicht ist **responsive**: Desktop/Chromebook bevorzugt (Split), auf Mobile **untereinander**.

### 4.3 Navigation (festgelegt)
- In der Ergebnisansicht gibt es **kein Zurück** zum Sortieren.

### 4.1 Admin-Flow (neu, TBD Details)
#### 4.1.1 User-Flow (Listen-Editor)
1. User Login
2. Listen-Übersicht (Standardliste + eigene Custom-Listen + ggf. schul-geteilte Listen)
3. Liste erstellen/löschen
4. Listen-Inhalte pflegen (Adjektive + Tooltip-Texte)
5. **Sharing**: pro Liste **Link + QR-Code** generieren/anzeigen (für Schüler:innen)
6. (neu) Sichtbarkeit/Teilen: Option „mit allen Lehrkräften meiner Schule teilen“
7. **Logout** (Button)

**UI/UX Vorgabe (festgelegt): Inline Editing + Auto-Save**
- Es gibt **keine separate View-/Edit-Ansicht** (kein „Bearbeiten“-Modus).
- Es gibt **keine Speichern-Buttons** und **keine Edit-Buttons** für Inhalte.
- Alle editierbaren Felder sind **immer direkt inline editierbar** (z. B. Listenname, Adjektiv, Erklärung, Beispiel).
- Speichern erfolgt **automatisch**:
  - z. B. beim Verlassen des Felds (Blur) und/oder mit kurzer Debounce während der Eingabe.
  - UI zeigt dezent den Status: **„Speichert…“ → „Gespeichert“**.
  - Bei Fehler: klare Fehlermeldung am Feld/oben + **Retry** (automatisch oder per „Erneut versuchen“).
- Löschen bleibt als explizite Aktion erlaubt (z. B. Trash-Icon) mit **Bestätigung**.

#### 4.1.2 Admin-Flow (Superadmin)
1. Admin Login
2. **Pending Inbox**:
  - Pending **Users** anzeigen und **freischalten/ablehnen**
  - Pending **Schulen** anzeigen und **freischalten/ablehnen**
3. User-Verwaltung: User anlegen/bearbeiten/löschen, Passwort setzen/zurücksetzen (CRUD)
4. User-Aktivierung: User **aktiv/passiv** umstellen; optional **Timer/Enddatum** setzen
5. **Statistik** (global): einfache Dashboard-Seite (siehe 2.7)
6. TBD: Admin darf ggf. alle Listen sehen (oder nur User-Verwaltung)
7. **Logout** (Button)

#### 4.1.3 User-Registrierung (neu, MVP)
1. User füllt Registrierungsformular aus:
  - **E-Mail** (ist **Benutzername**)
  - **Passwort**
  - **Schule**: bestehende Schule auswählen (Dropdown) **oder** **neue Schule hinzufügen**
2. User-Account startet als **pending** (nicht aktiv)
3. Admin sieht „ausstehende“ Registrierungen und schaltet frei (→ `active`, optional `active_until`)

Benachrichtigung: Nach erfolgreicher Registrierung wird eine **SMS an den Admin** gesendet (siehe 2.4).

Hinweis (neue Schule): Wenn eine neue Schule hinzugefügt wird, wird sie als **pending** angelegt und muss vom Admin **freigeschaltet** werden (analog zu Usern).

Hinweis (Schul-Lizenz): Wenn die ausgewählte Schule bereits lizenziert ist, wird der User beim Registrieren **automatisch aktiv**. (Details TBD: ob trotzdem Admin-Approval nötig ist)

## 5. Inhalte: Adjektive + Erklärtexte
### 5.1 Anforderungen
- Adjektive müssen für 12–15 verständlich sein.
- Jede Karte hat:
  - **Adjektiv** (z. B. „hilfsbereit“)
  - **Kurz-Erklärung** (1–2 Sätze)
  - **Beispiel** (konkreter Satz aus Schulsituation)
- Darstellung in der Sortieransicht: **standardmäßig nur das Adjektiv**; **Erklärung + Beispiel als Tooltip** beim Hover.
- Alternative zum Hover (Touch/Keyboard):
  - Button neben der Karte: **„Eigenschaft erklären“** (öffnet Erklärung + Beispiel)
  - Tastatur: **Leertaste** toggelt Erklärung + Beispiel für die aktuelle Karte
- Ton: wertschätzend, nicht pathologisierend.
- Wortwahl: möglichst **positiv/neutral formuliert** (keine „Labels“ wie negative Eigenschaften).
  - Beispiel-Mapping: „ungeduldig“ → **„effizient“**, „schüchtern“ → **„zurückhaltend“**

### 5.2 Umfang (TBD)
- Anzahl Adjektive (Standardliste, festgelegt): **30**
  - Begründung: gut machbar in ~10–15 Minuten inkl. Lesen/Reflektieren und reduziert Ermüdung.
  - Custom-Listen dürfen abweichen (z. B. 12–60), abhängig vom Einsatz.
- Mischung: positive/neutral/ambivalent (TBD)
- Themenfelder: Verhalten, Gefühle, Sozial, Lernen (TBD)

### 5.2.1 Standardliste als Seed (festgelegt)
- Die **Standardliste** wird beim ersten Start/Deployment als **Seed** in die SQLite-DB geschrieben.
- Seed muss **idempotent** sein (nicht doppelt einfügen).
- Die Standardliste ist danach im Backend **bearbeitbar** (inkl. Tooltip-Texte).
- Rechte: **Admin (Superadmin)** darf Standardliste bearbeiten. (TBD: dürfen auch aktive Users Standardliste ändern?)
- Bearbeitung erfolgt im Backend ebenfalls als **Inline Editing mit Auto-Save** (wie 4.1.1; keine Speichern/Edit-Buttons).

### 5.2.2 Vorschlag Standardliste (30 Adjektive, Seed)
Kriterien: Deutsch, verständlich für ~12-Jährige, nicht nur Synonyme, Mischung aus emotional/kognitiv/körperlich; breit einsetzbar (Berufswahl: Handwerk/Technik/Soziales/Organisation/Kreativ/Service/IT).

Format pro Karte: **Adjektiv** + Tooltip (Erklärung) + Beispiel.

1. **zuverlässig** — Du machst, was du versprochen hast.
   Beispiel: „Wenn ich sage, ich bringe etwas mit, dann mache ich das auch.“
2. **teamfähig** — Du kannst gut mit anderen zusammenarbeiten.
   Beispiel: „In Gruppenarbeiten höre ich zu und mache meinen Teil.“
3. **hilfsbereit** — Du unterstützt andere, wenn sie Hilfe brauchen.
   Beispiel: „Wenn jemand etwas nicht versteht, erkläre ich es ruhig.“
4. **freundlich** — Du gehst respektvoll und nett mit anderen um.
   Beispiel: „Ich grüße und bleibe höflich, auch wenn ich gestresst bin.“
5. **kommunikativ** — Du kannst Dinge gut sagen oder erklären.
   Beispiel: „Ich kann in Worten sagen, was ich brauche oder meine.“
6. **empathisch** — Du merkst, wie es anderen geht, und nimmst das ernst.
   Beispiel: „Ich sehe, wenn jemand traurig ist, und frage nach.“
7. **geduldig** — Du bleibst dran, auch wenn es länger dauert.
   Beispiel: „Ich übe weiter, auch wenn es nicht sofort klappt.“
8. **gelassen** — Du bleibst eher ruhig, wenn etwas schiefgeht.
   Beispiel: „Wenn ich einen Fehler mache, atme ich durch und mache weiter.“
9. **mutig** — Du traust dich, Neues auszuprobieren oder zu sagen.
   Beispiel: „Ich melde mich, auch wenn ich nicht 100% sicher bin.“
10. **selbstständig** — Du kannst Aufgaben allein beginnen und durchziehen.
  Beispiel: „Ich starte eine Aufgabe ohne dauernd nachzufragen.“
11. **verantwortungsbewusst** — Du denkst an Folgen und passt auf.
  Beispiel: „Ich gehe sorgfältig mit Material und Geräten um.“
12. **ordentlich** — Du hältst Sachen übersichtlich und sauber.
  Beispiel: „Ich räume meinen Arbeitsplatz am Ende auf.“
13. **pünktlich** — Du bist rechtzeitig da und beginnst rechtzeitig.
  Beispiel: „Ich bin zur Stunde da, wenn es losgeht.“
14. **konzentriert** — Du kannst deine Aufmerksamkeit bei einer Sache behalten.
  Beispiel: „Ich arbeite mehrere Minuten ohne abzuschweifen.“
15. **aufmerksam** — Du bemerkst Details und was um dich passiert.
  Beispiel: „Ich sehe, wenn etwas fehlt oder anders ist.“
16. **genau** — Du arbeitest sorgfältig und prüfst deine Ergebnisse.
  Beispiel: „Ich kontrolliere, ob alles stimmt, bevor ich abgebe.“
17. **strukturiert** — Du gehst Schritt für Schritt vor.
  Beispiel: „Ich mache zuerst einen Plan und arbeite dann ab.“
18. **analytisch** — Du versuchst zu verstehen, warum etwas so ist.
  Beispiel: „Ich frage: ‚Woran liegt das?‘ und suche die Ursache.“
19. **kreativ** — Du hast eigene Ideen und findest neue Lösungen.
  Beispiel: „Ich finde eine andere Möglichkeit, etwas zu gestalten.“
20. **lernbereit** — Du willst Neues lernen und üben.
  Beispiel: „Ich probiere Tipps aus und werde besser.“
21. **praktisch** — Du packst an und machst Dinge gerne „hands-on“.
  Beispiel: „Ich baue lieber etwas, statt nur darüber zu reden.“
22. **handwerklich geschickt** — Du kannst gut mit Werkzeug/Material umgehen.
  Beispiel: „Ich kann sauber schneiden, kleben oder schrauben.“
23. **feinmotorisch** — Du kannst kleine, genaue Bewegungen gut steuern.
  Beispiel: „Ich kann sehr genau zeichnen oder kleine Teile einsetzen.“
24. **ausdauernd** — Du bleibst dran, auch wenn es anstrengend ist.
  Beispiel: „Ich gebe nicht schnell auf, sondern mache weiter.“
25. **belastbar** — Du kannst mit Stress umgehen, ohne sofort zusammenzuklappen.
  Beispiel: „Wenn viel los ist, bleibe ich handlungsfähig.“
26. **flexibel** — Du kannst dich umstellen, wenn sich etwas ändert.
  Beispiel: „Wenn der Plan sich ändert, mache ich trotzdem weiter.“
27. **neugierig** — Du willst wissen, wie etwas funktioniert.
  Beispiel: „Ich stelle Fragen und probiere Dinge aus.“
28. **technisch interessiert** — Du hast Lust auf Technik/Computer/Geräte.
  Beispiel: „Ich finde es spannend, wie Apps, Maschinen oder Geräte funktionieren.“
29. **serviceorientiert** — Du achtest darauf, dass es anderen gut geht.
  Beispiel: „Ich frage: ‚Kann ich dir helfen?‘ und bleibe freundlich.“
30. **fair** — Du behandelst andere gerecht.
  Beispiel: „Ich halte Regeln ein und finde, alle sollen eine Chance haben.“

### 5.3 Listen-Konzept
- Es gibt eine **Standardliste** (kuratiert, sofort nutzbar).
- Zusätzlich können Users **Custom-Listen** anlegen.
- Jede Liste enthält mehrere Adjektiv-Karten (jeweils Adjektiv + Erklärung + Beispiel).
- TBD: Können Schüler:innen mehrere Listen mischen, oder genau eine pro Session?
- Jede Liste hat eine **sharebare URL** und einen **QR-Code**, die direkt in diese Liste führen.
- **Keine öffentliche Listen-Übersicht** nötig: nur die Standardliste ist ohne Link erreichbar.
- Share-Links für Custom-Listen sind **nicht erratbar** (Token-URLs) und können **ablaufen**.

### 5.3.2 Share-Link Tokens (festgelegt)
- Custom-Listen werden für Schüler:innen über eine **Token-URL** geteilt (z. B. `/l/<token>`).
- Tokens sind **schwer zu erraten** (cryptographically random).
- Gültigkeit: ein Share-Link kann z. B. **1 Jahr gültig** sein.
- Nutzung: derselbe Link/QR kann von **einer ganzen Schule** genutzt werden (keine individuellen Accounts für Schüler:innen).
- Motivation: später ggf. **Monetarisierung/Lizenzmodell** über zeitlich begrenzte Links.

### 5.3.3 Gültigkeit / Aktivierung (für Pilot relevant)
- Admin kann Users **aktiv** oder **passiv** setzen.
- Optional kann Admin pro User ein **Enddatum/Timer** setzen.
- Bedeutung **passiv** (festgelegt):
  - User kann sich **nicht** einloggen
  - Share-Links/QR-Codes und PDF-Export-Vorteile sollen **nicht** nutzbar sein
- Schul-Lizenz: Sobald eine Schule lizenziert ist (mind. ein aktiver User), sollen schul-geteilte Listen für „alle der Schule“ sichtbar sein. (Details TBD)
- Schul-Lizenz (festgelegt): Sobald eine Schule lizenziert ist (mind. ein aktiver User), sind **alle Users dieser Schule aktiv**.
- Empfehlung/Regel: Share-Link ist nur gültig, wenn
  - `share_enabled = true`
  - `share_expires_at` leer oder in der Zukunft
  - und Owner-User aktiv ist (z. B. `status=active` und `active_until` leer oder in der Zukunft)

### 5.3.4 Export-Regeln (festgelegt)
- **Standardliste (öffentlich, ohne Link)**:
  - Nutzung ist erlaubt
  - Ergebnisansicht: PDF-Button ist **sichtbar aber deaktiviert** mit Hinweis: **„PDF nur mit Schul-Lizenz“**
- **Custom-Liste über Share-Link/QR**:
  - Nutzung ist erlaubt, solange Share-Link gültig ist (siehe oben)
  - Ergebnisansicht: **PDF Export / Drucken erlaubt**, wenn Owner-User aktiv ist

#### 5.3.1 Ownership & Sichtbarkeit (Admin)
**Terminologie (festgelegt):**
- **Admin** = Superadmin (verwaltet User-Konten)
- **User** = kann Listen/Inhalte pflegen

**Ownership & Sichtbarkeit (User):**
- Es gibt **mehrere User**.
- Custom-Listen haben eine **Owner-User-ID**.
- Im User-Bereich sieht ein User:
  - die **Standardliste**
  - **eigene** Custom-Listen (Owner = aktueller User)

#### 5.3.1.1 Schul-Sharing (neu)
- Jeder User gehört zu genau **einer Schule**.
- Eine Custom-Liste kann optional mit **allen Lehrkräften derselben Schule** geteilt werden.
- Default: neue Custom-Listen sind **privat** (Schul-Sharing aus).
- Wenn „Schul-Sharing“ aktiv ist, sehen andere Users derselben Schule die Liste in ihrer Listen-Übersicht.
- Rechte / Bearbeiten (festgelegt): **Copy-on-Write**
  - Schul-geteilte Listen können von allen Users der Schule **angesehen und genutzt** werden.
  - Wenn ein User Änderungen macht, wird automatisch eine **Kopie** als **eigene private Custom-Liste** erstellt (Fork).
  - Die Kopie wird standardmäßig **mit der Schule geteilt** (Schul-Sharing an).
  - Die ursprüngliche schul-geteilte Liste wird dadurch **nicht** verändert.
  - TBD: UI-Text, z. B. „Du bearbeitest eine Kopie“ / „Als eigene Liste speichern“.

**Admin-Rechte (TBD):**
- Admin hat mindestens Zugriff auf die **User-Tabelle**.
- TBD: Admin sieht/editiert zusätzlich alle Listen oder nur User-Verwaltung.

### 5.4 Datenmodell (SQLite, Entwurf)
- Tabelle `lists`: `id`, `name`, `description` (optional), `is_default`, `owner_user_id` (nullable für Standardliste), `share_token`, `share_expires_at`, `share_enabled`, `share_with_school`, `source_list_id` (nullable; Fork/Quelle), `created_at`, `updated_at`
- Erweiterung `lists` (Sharing): `share_with_school` (boolean)
- Tabelle `adjectives`: `id`, `list_id`, `word`, `explanation`, `example`, `order_index` (optional), `active`
- Tabelle `schools`: `id`, `name`, `status` (active/pending), `created_at`
- Tabelle `users`: `id`, `email` (unique, Login), `password_hash`, `school_id`, `status` (pending/active/passive), `active_until` (nullable), `created_at`, `last_login_at`
- Optional `users` Felder: `notes`/`admin_comment`
- Tabelle `admins`: `id`, `username`, `password_hash`, `created_at`, `last_login_at` (typisch 1 Account)

#### 5.4.1 Analytics Tabellen (Vorschlag)
- Tabelle `analytics_sessions`: `id` (uuid), `list_id` (nullable für Standardliste), `is_standard_list` (bool), `theme_id`, `started_at`, `finished_at` (nullable), `pdf_exported_at` (nullable)
- Tabelle `analytics_assignments`: `id`, `session_id`, `adjective_id`, `bucket` (selten/manchmal/oft), `assigned_at`
- Optional Rollups (TBD): `analytics_daily` für schnelle Auswertungen

### 5.5 Initiales Admin-Setup (festgelegt)
- Der **Admin (Superadmin)** wird initial **manuell** vom Betreiber direkt in der Datenbank angelegt.

## 6. Interaktion & Bedienung
- Bedienung muss **sehr einfach** sein.
- **3 Buckets** sichtbar: „selten“, „manchmal“, „oft“.
- **Sequenzielles Sortieren**: Adjektive erscheinen **nacheinander** als einzelne „aktive“ Karte (Karten-Stapel/Stepper), damit Tastatursteuerung eindeutig ist.
- Reihenfolge: Adjektive werden pro Sitzung **zufällig gemischt** (Shuffle).
- Es gibt **keine Skip-Funktion**: jedes Adjektiv muss einem Bucket zugeordnet werden, um abschließen zu können.
- **Drag & Drop**: Karten können per Maus/Touch in einen Bucket gezogen werden.
- **Keyboard-Zuordnung** (für schnelle Bedienung):
  - Links = „selten“ (z. B. Pfeil links oder Taste `A`)
  - Unten/Mitte = „manchmal“ (z. B. Pfeil unten oder Taste `S`)
  - Rechts = „oft“ (z. B. Pfeil rechts oder Taste `D`)
  - **Undo**: macht die letzte Zuordnung rückgängig und legt das Adjektiv zurück in „noch zuordnen“ (z. B. Pfeil hoch oder Taste `W`, plus Undo-Button)
- TBD: Fokus/Navigation (welche Karte ist „aktiv“ für Tastatur?)
- Fokus/Navigation: die jeweils angezeigte Karte ist automatisch die **aktive** Karte.
- MVP: Es reicht, wenn die **Zuordnung per Tastatur** für die aktive Karte funktioniert; vollständige Tastatur-Navigation für alle UI-Elemente ist nicht zwingend.
- Karten-Lesbarkeit: große Schrift, klare Kontraste.

### 6.1 Karten-Design
- Karten sind visuell **hexagonal** (passend zur späteren Hex-Visualisierung).

### 6.2 Layout der Sortieransicht (festgelegt)
- **Linke Hälfte**:
  - **oben**: zentrale, große **aktive Karte** (das aktuell zuzuordnende Adjektiv)
  - **unten**: die **3 Buckets** („selten“, „manchmal“, „oft“) als **reine Zielflächen**
- Buckets zeigen **keine Listen/Chips** der bereits zugeordneten Wörter (nur Target-Flächen).
- **Rechte Hälfte**:
  - **Live-Grafik** (Hex-Vorschau), die sich während des Sortierens aktualisiert
  - Theme-Auswahl (Dropdown) **bei der Darstellung** (rechte Seite, z. B. oben)

### 6.2.1 Responsive / Mobile View (festgelegt)
- **Split-Screen (Desktop/Chromebook)**: wie in 6.2 beschrieben (links: Karte+Buckets, rechts: Live-Grafik).
- **Mobile (untereinander / stacked)**: Die Bereiche werden **vertikal untereinander** angeordnet.
  - Reihenfolge (empfohlen): **aktive Karte** → **Buckets** → **Live-Grafik**.
  - Theme-Auswahl bleibt verfügbar (z. B. über der Live-Grafik oder als kompakte Leiste).
- Mobile UX (festgelegt): Die **Live-Grafik** ist auf Mobile **einklappbar** und standardmäßig **eingeklappt**, damit weniger gescrollt werden muss.
  - Toggle-Button (TBD Text): z. B. **„Vorschau anzeigen“** / **„Vorschau ausblenden“**.
  - Wenn eingeklappt, laufen Zuordnungen weiter und die Vorschau ist beim Aufklappen sofort aktuell.
- Breakpoint (TBD, Richtwert): ab ca. **`min-width: 900px`** Split-Screen, darunter Mobile-Stack.

## 7. Hexagon-Visualisierung (TBD Details)
### 7.1 Random-Layout (festgelegt für „oft“)
- Ziel: Die Grafik soll bei verschiedenen Schüler:innen **nicht identisch** wirken; dasselbe Adjektiv soll **nicht immer an derselben Position** erscheinen.
- Platzierungslogik (für **„oft“**; **„manchmal“** folgt danach nach denselben Ring-Regeln):
  1. Beginne mit der Zentrumskachel **„Ich bin“**.
  2. Platziere **„oft“**-Kacheln **zufällig**, indem jeweils eine **zufällige freie angrenzende Position** an den bereits platzierten Kacheln gewählt wird.
  3. Es wird **zuerst der 1. Ring** (direkte Nachbarpositionen um das Zentrum) gefüllt; ist der Ring voll, werden Plätze im **nächsten Ring** über die Nachbarschaften „ausgelost“ (weiter nach außen), usw.
- Ergebnis: Die Verteilung der „oft“-Kacheln ist **bei jedem Neuladen/Neu-Anordnen potenziell anders**.

### 7.1.1 Platzierung „manchmal“ (festgelegt)
- Nach dem Platzieren aller „oft“-Kacheln werden **„manchmal“**-Kacheln platziert.
- Sie nutzen **dieselben Regeln** (zufällige freie Positionen; Ringe von innen nach außen zuerst auffüllen).
- Es gibt **keinen festen Ring** für „manchmal“: Wenn „oft“ mehrere Ringe belegt, startet „manchmal“ **außerhalb** der bereits belegten Positionen und füllt weiter nach außen.

### 7.2 „Anders anordnen“-Button
- In der Ergebnisansicht gibt es einen Button **„Anders anordnen“**.
- Wirkung: führt die Random-Platzierung **nach denselben Regeln erneut aus** (nur Layout ändert sich).
- Wichtig: Kategorien-Zuordnung (**selten/manchmal/oft**) bleibt unverändert.

### 7.3 Live-Vorschau (Realtime)
- Während des Sortierens wird die Hex-Grafik **in Echtzeit** als Vorschau angezeigt.
- Wenn eine Karte einem Bucket zugeordnet wird:
  - Bei **„oft“** oder **„manchmal“** wird sofort eine Kachel nach den Layout-Regeln „angehängt“.
  - Bei **„selten“** passiert visuell nichts (da „selten“ nicht dargestellt wird).
- TBD: Ob „Anders anordnen“ auch während des Sortierens verfügbar ist oder erst am Ende.

## 8. Druck & Export
- Ziel: **schöner Printout** (A4) mit sauberem Layout.
- Exportformate: **PDF-Download des aktuellen Stands** (einmalig, keine Historie)
- Optional: Name/Klasse/Datum auf Ausdruck (TBD)

### 8.0 Seitenformat (festgelegt)
- PDF: **A4 Hochformat** (Portrait)
- Hinweis: Hex-Grafik ist konzentrisch, daher kein Vorteil durch Querformat.

### 8.1 PDF-Inhalt (festgelegt)
- PDF enthält **nur die Grafik** (keine zusätzliche Textliste).
- Zentrum: **„Ich bin“**
- **„oft“**-Kacheln: **bold** (werden zuerst platziert; können mehrere Ringe belegen)
- **„manchmal“**-Kacheln: **nicht bold** (werden nach „oft“ platziert; füllen weiter nach außen)
- **„selten“** erscheint **nicht** in der Grafik.
- Kein School-Branding (kein Logo/Schulname) im PDF.
- Datum: aktuelles Datum wird im PDF klein angezeigt (z. B. im Footer).
- Datumsformat: deutsch numerisch, z. B. **`26.01.2026`**
- Kein zusätzlicher Titel im PDF (nur Grafik + Datum).

### 8.2 PDF-Dateiname (festgelegt)
- Standard-Dateiname beim Download: **`ich-bin-vielseitig.pdf`**

## 9. Design (Look & Feel)
- „Nice design“: modern, freundlich, ruhig.
- Farben: TBD
- Typografie: TBD
- Barrierefreiheit: Kontrast, Schriftgrößen, einfache Sprache (TBD)

### 9.2 Motion & Sound
- **Keine Sounds**.
- Animationen: **nice-to-have** (z. B. sanftes „Anheften“ der Hex-Kachel, Drag-Feedback).
- Barrierefreiheit: Wenn „Bewegungen reduzieren“ aktiv ist (CSS `prefers-reduced-motion`), sollen Animationen **weggelassen** werden.

### 9.1 Farbschemata (neu)
- Vor dem PDF-Export kann ein **Farbschema** ausgewählt werden.
- UI: **Dropdown** mit **6** vordefinierten Styles.
- Export: PDF ist **farbig** und nutzt das ausgewählte Farbschema.
- Die 6 Farbschemata sind **hardcoded** (nicht im Backend editierbar).
- Ein Farbschema ist ein **komplettes Theme** (Hintergrund, Kachel-Füllung, Outline/Border, Schriftfarben/Typo-Farben).
- Das ausgewählte Theme gilt bereits **während dem Sortieren** (UI + Live-Grafik) und wird in der Ergebnisansicht/PDF weiterverwendet.
- Das **gesamte UI** passt sich dem Theme an (nicht nur die Hex-Grafik).
- Default: bei jedem neuen Durchlauf wird ein Theme **zufällig** als Start-Theme gewählt (kein Merken).

## 10. Fehlerfälle & Edge Cases (TBD)
- Was wenn Nutzer:in nichts in „oft“ hat?
- Was wenn sehr viele in „oft“?
- Rückgängig innerhalb der Sitzung: **Undo für letzte Aktion** (keine langfristige Historie)
- Reset/Neu starten: TBD (z. B. „Neu beginnen“ löscht aktuellen Stand)

### 10.1 Reset-Verhalten (festgelegt/teilweise TBD)
- Es gibt im Schüler:innen-Modus **keinen „Neu starten“ Button**.
- Ein neuer Durchlauf startet, indem Schüler:innen den **QR-Code erneut scannen** bzw. den Link neu öffnen.
- Lokal gespeicherter Stand: **eine Session pro Gerät/Browser** (nicht parallel pro Liste/Token).
- Wenn ein neuer Link/QR geöffnet wird, startet die App **automatisch neu** und **überschreibt** den lokalen Stand (ohne Warnung).
- Verhalten bei Browser-Refresh (F5): **Wiederherstellen**
  - Der aktuelle Session-Stand wird **lokal im Browser** gespeichert (**`localStorage`**), sodass er auch nach Tab schließen wiederherstellbar ist.
  - Nach Refresh wird der Stand wieder geladen.
  - Dazu gehört auch das aktuell gewählte **Theme** (Theme bleibt bei Restore gleich).
  - Dazu gehört auch die aktuelle **Hex-Anordnung** (Layout bleibt bei Restore gleich; Neu-Auslosung nur über „Anders anordnen“).
  - Keine serverseitige Speicherung von Schüler:innen-Ergebnissen.
  - Der lokale Stand wird **direkt nach erfolgreichem PDF-Export** gelöscht (Reset für nächsten Durchlauf).
  - Kein zusätzlicher UI-Hinweis wie „Fortschritt wird gespeichert“.

## 11. Erfolgskriterien / Akzeptanzkriterien (TBD)
- Sortieren funktioniert auf Zielgerät(en) stabil.
- Ergebnis-Visual entspricht Ring-Regeln.
- Druck ist ohne Layout-Brüche.

## 12. Rollout (Pilot)
- Erstes Ziel: Test an der **eigenen Schule** (Pilotbetrieb)

---

## Offene Fragen (wird iterativ gefüllt)
- Plattform/Endgeräte?
- Offline/Datenschutz?
- Anzahl Adjektive?
- Regeln für Ringe/Überlauf?
- Exportformat?
