export default function ImpressumPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-gray-500">Rechtliches</p>
        <h1 className="text-3xl font-semibold text-gray-900">Impressum</h1>
        <p className="text-gray-600">Bitte ersetzen Sie diesen Platzhalter durch den offiziellen Impressum-Text des Betreibers.</p>
      </header>

      <div className="card space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Betreiberangaben</h2>
        <p className="text-gray-700">Fuegen Sie hier Name/Firma, vollstaendige Anschrift, Kontakt (E-Mail, Telefon) und vertretungsberechtigte Person ein.</p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Register & Steuern</h2>
        <p className="text-gray-700">Optional: Registergericht und Registernummer, USt-IdNr., Aufsichtsbehoerde falls relevant.</p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Kontakt</h2>
        <p className="text-gray-700">E-Mail: <span className="font-mono text-gray-900">[kontakt@example.com]</span></p>
        <p className="text-gray-700">Telefon: <span className="font-mono text-gray-900">[+49 000 000000]</span></p>
      </div>

      <p className="text-sm text-gray-500">Hinweis: Dieser Inhalt ist ein Platzhalter. Bitte durch die rechtlich korrekten Angaben des Betreibers ersetzen.</p>
    </div>
  );
}
