export default function DatenschutzPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-gray-500">Rechtliches</p>
        <h1 className="text-3xl font-semibold text-gray-900">Datenschutzerklaerung</h1>
        <p className="text-gray-600">Platzhalter fuer die offizielle Datenschutzerklaerung. Bitte durch den finalen Text ersetzen.</p>
      </header>

      <div className="card space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Keine Speicherung von Schueler:innen-Daten</h2>
        <p className="text-gray-700">Die Adjektiv-Sortierungen der Schueler:innen werden nicht serverseitig gespeichert. Ergebnisse verbleiben lokal bzw. werden nur ueber temporaere Tokens mit Lehrkraeften geteilt.</p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Verantwortliche Stelle</h2>
        <p className="text-gray-700">Bitte hier Verantwortliche Stelle, Kontakt (E-Mail, Telefon) und ggf. Datenschutzbeauftragte:r eintragen.</p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Erhobene Daten</h2>
        <p className="text-gray-700">Platzhalter fuer eine Liste der verarbeiteten Daten (z. B. Login-Daten fuer Lehrkraefte/Admins, Server-Logs). Klarstellen, dass keine personenbezogenen Schueler:innendaten persistiert werden.</p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Rechtsgrundlagen & Rechte</h2>
        <p className="text-gray-700">Bitte Rechtsgrundlagen (Art. 6 DSGVO) und Nutzerrechte (Auskunft, Loeschung, Berichtigung, Widerspruch, Beschwerderecht) ergaenzen.</p>
      </div>

      <p className="text-sm text-gray-500">Hinweis: Dieser Inhalt ist ein Platzhalter. Bitte durch die pruefbare, rechtliche Endfassung ersetzen.</p>
    </div>
  );
}
