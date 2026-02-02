"""
Seed data for premium adjective lists.
These lists are only available to registered users and can be shared via QR code.
"""

# Extended list with 50 adjectives (original 30 + 20 new ones)
GROSSE_LISTE_ADJECTIVES = [
    # Original 30 adjectives
    {
        "word": "zuverlässig",
        "explanation": "Du machst, was du versprochen hast.",
        "example": "Wenn ich sage, ich bringe etwas mit, dann mache ich das auch.",
    },
    {
        "word": "teamfähig",
        "explanation": "Du kannst gut mit anderen zusammenarbeiten.",
        "example": "In Gruppenarbeiten höre ich zu und mache meinen Teil.",
    },
    {
        "word": "hilfsbereit",
        "explanation": "Du unterstützt andere, wenn sie Hilfe brauchen.",
        "example": "Wenn jemand etwas nicht versteht, erkläre ich es ruhig.",
    },
    {
        "word": "freundlich",
        "explanation": "Du gehst respektvoll und nett mit anderen um.",
        "example": "Ich grüße und bleibe höflich, auch wenn ich gestresst bin.",
    },
    {
        "word": "kommunikativ",
        "explanation": "Du kannst Dinge gut sagen oder erklären.",
        "example": "Ich kann in Worten sagen, was ich brauche oder meine.",
    },
    {
        "word": "empathisch",
        "explanation": "Du merkst, wie es anderen geht, und nimmst das ernst.",
        "example": "Ich sehe, wenn jemand traurig ist, und frage nach.",
    },
    {
        "word": "geduldig",
        "explanation": "Du bleibst dran, auch wenn es länger dauert.",
        "example": "Ich übe weiter, auch wenn es nicht sofort klappt.",
    },
    {
        "word": "gelassen",
        "explanation": "Du bleibst eher ruhig, wenn etwas schiefgeht.",
        "example": "Wenn ich einen Fehler mache, atme ich durch und mache weiter.",
    },
    {
        "word": "mutig",
        "explanation": "Du traust dich, Neues auszuprobieren oder zu sagen.",
        "example": "Ich melde mich, auch wenn ich nicht 100% sicher bin.",
    },
    {
        "word": "selbstständig",
        "explanation": "Du kannst Aufgaben allein beginnen und durchziehen.",
        "example": "Ich starte eine Aufgabe ohne dauernd nachzufragen.",
    },
    {
        "word": "verantwortungsbewusst",
        "explanation": "Du denkst an Folgen und passt auf.",
        "example": "Ich gehe sorgfältig mit Material und Geräten um.",
    },
    {
        "word": "ordentlich",
        "explanation": "Du hältst Sachen übersichtlich und sauber.",
        "example": "Ich räume meinen Arbeitsplatz am Ende auf.",
    },
    {
        "word": "pünktlich",
        "explanation": "Du bist rechtzeitig da und beginnst rechtzeitig.",
        "example": "Ich bin zur Stunde da, wenn es losgeht.",
    },
    {
        "word": "konzentriert",
        "explanation": "Du kannst deine Aufmerksamkeit bei einer Sache behalten.",
        "example": "Ich arbeite mehrere Minuten ohne abzuschweifen.",
    },
    {
        "word": "aufmerksam",
        "explanation": "Du bemerkst Details und was um dich passiert.",
        "example": "Ich sehe, wenn etwas fehlt oder anders ist.",
    },
    {
        "word": "genau",
        "explanation": "Du arbeitest sorgfältig und prüfst deine Ergebnisse.",
        "example": "Ich kontrolliere, ob alles stimmt, bevor ich abgebe.",
    },
    {
        "word": "strukturiert",
        "explanation": "Du gehst Schritt für Schritt vor.",
        "example": "Ich mache zuerst einen Plan und arbeite dann ab.",
    },
    {
        "word": "analytisch",
        "explanation": "Du versuchst zu verstehen, warum etwas so ist.",
        "example": "Ich frage: 'Woran liegt das?' und suche die Ursache.",
    },
    {
        "word": "kreativ",
        "explanation": "Du hast eigene Ideen und findest neue Lösungen.",
        "example": "Ich finde eine andere Möglichkeit, etwas zu gestalten.",
    },
    {
        "word": "lernbereit",
        "explanation": "Du willst Neues lernen und üben.",
        "example": "Ich probiere Tipps aus und werde besser.",
    },
    {
        "word": "praktisch",
        "explanation": "Du packst an und machst Dinge gerne 'hands-on'.",
        "example": "Ich baue lieber etwas, statt nur darüber zu reden.",
    },
    {
        "word": "handwerklich geschickt",
        "explanation": "Du kannst gut mit Werkzeug/Material umgehen.",
        "example": "Ich kann sauber schneiden, kleben oder schrauben.",
    },
    {
        "word": "feinmotorisch",
        "explanation": "Du kannst kleine, genaue Bewegungen gut steuern.",
        "example": "Ich kann sehr genau zeichnen oder kleine Teile einsetzen.",
    },
    {
        "word": "ausdauernd",
        "explanation": "Du bleibst dran, auch wenn es anstrengend ist.",
        "example": "Ich gebe nicht schnell auf, sondern mache weiter.",
    },
    {
        "word": "belastbar",
        "explanation": "Du kannst mit Stress umgehen, ohne sofort zusammenzuklappen.",
        "example": "Wenn viel los ist, bleibe ich handlungsfähig.",
    },
    {
        "word": "flexibel",
        "explanation": "Du kannst dich umstellen, wenn sich etwas ändert.",
        "example": "Wenn der Plan sich ändert, mache ich trotzdem weiter.",
    },
    {
        "word": "neugierig",
        "explanation": "Du willst wissen, wie etwas funktioniert.",
        "example": "Ich stelle Fragen und probiere Dinge aus.",
    },
    {
        "word": "technisch interessiert",
        "explanation": "Du hast Lust auf Technik/Computer/Geräte.",
        "example": "Ich finde es spannend, wie Apps, Maschinen oder Geräte funktionieren.",
    },
    {
        "word": "serviceorientiert",
        "explanation": "Du achtest darauf, dass es anderen gut geht.",
        "example": "Ich frage: 'Kann ich dir helfen?' und bleibe freundlich.",
    },
    {
        "word": "fair",
        "explanation": "Du behandelst andere gerecht.",
        "example": "Ich halte Regeln ein und finde, alle sollen eine Chance haben.",
    },
    # 20 new adjectives to fill gaps
    {
        "word": "ehrlich",
        "explanation": "Du sagst die Wahrheit, auch wenn es schwierig ist.",
        "example": "Ich gebe zu, wenn ich einen Fehler gemacht habe.",
    },
    {
        "word": "respektvoll",
        "explanation": "Du behandelst andere mit Achtung und Wertschätzung.",
        "example": "Ich lasse andere ausreden und nehme ihre Meinung ernst.",
    },
    {
        "word": "organisiert",
        "explanation": "Du behältst den Überblick und planst voraus.",
        "example": "Ich weiss, was ich heute und morgen erledigen muss.",
    },
    {
        "word": "motiviert",
        "explanation": "Du hast Antrieb und gehst Aufgaben mit Energie an.",
        "example": "Ich freue mich auf neue Projekte und packe sie an.",
    },
    {
        "word": "reflektiert",
        "explanation": "Du denkst über dein Verhalten nach und lernst daraus.",
        "example": "Nach einer Aufgabe überlege ich, was ich besser machen könnte.",
    },
    {
        "word": "offen",
        "explanation": "Du bist aufgeschlossen für neue Ideen und Menschen.",
        "example": "Ich probiere gerne Neues aus und lerne neue Leute kennen.",
    },
    {
        "word": "entscheidungsfreudig",
        "explanation": "Du kannst Entscheidungen treffen, ohne ewig zu zögern.",
        "example": "Ich wäge ab und entscheide mich dann klar.",
    },
    {
        "word": "diplomatisch",
        "explanation": "Du kannst Konflikte entschärfen und vermitteln.",
        "example": "Ich finde einen Kompromiss, mit dem alle leben können.",
    },
    {
        "word": "sorgfältig",
        "explanation": "Du achtest auf Qualität und Details bei der Arbeit.",
        "example": "Ich schaue nochmal drüber, bevor ich etwas abgebe.",
    },
    {
        "word": "selbstkritisch",
        "explanation": "Du erkennst eigene Schwächen und arbeitest daran.",
        "example": "Ich weiss, wo ich mich verbessern kann, und arbeite daran.",
    },
    {
        "word": "tolerant",
        "explanation": "Du akzeptierst, dass andere anders sind oder denken.",
        "example": "Ich respektiere andere Meinungen, auch wenn ich sie nicht teile.",
    },
    {
        "word": "initiativ",
        "explanation": "Du ergreifst von dir aus Initiative und wartest nicht ab.",
        "example": "Ich schlage neue Ideen vor und setze sie um.",
    },
    {
        "word": "zielstrebig",
        "explanation": "Du verfolgst deine Ziele konsequent.",
        "example": "Ich weiss, was ich erreichen will, und arbeite darauf hin.",
    },
    {
        "word": "anpassungsfähig",
        "explanation": "Du kommst mit verschiedenen Situationen gut zurecht.",
        "example": "Auch in neuen Umgebungen finde ich mich schnell zurecht.",
    },
    {
        "word": "durchsetzungsfähig",
        "explanation": "Du kannst deine Meinung vertreten und dich behaupten.",
        "example": "Ich sage klar, was ich denke, ohne andere zu verletzen.",
    },
    {
        "word": "kritikfähig",
        "explanation": "Du kannst Kritik annehmen und konstruktiv damit umgehen.",
        "example": "Feedback nehme ich an und versuche, mich zu verbessern.",
    },
    {
        "word": "gewissenhaft",
        "explanation": "Du arbeitest pflichtbewusst und verlässlich.",
        "example": "Aufgaben erledige ich vollständig und so gut ich kann.",
    },
    {
        "word": "begeisterungsfähig",
        "explanation": "Du kannst dich für Themen begeistern und andere anstecken.",
        "example": "Wenn mich etwas interessiert, stecke ich andere damit an.",
    },
    {
        "word": "lösungsorientiert",
        "explanation": "Du suchst nach Lösungen statt Problemen.",
        "example": "Ich frage: 'Wie können wir das lösen?' statt zu jammern.",
    },
    {
        "word": "authentisch",
        "explanation": "Du bist echt und verstellt dich nicht.",
        "example": "Ich bleibe mir selbst treu und spiele keine Rolle.",
    },
]

# Sport list with 40 adjectives focusing on athletic abilities
SPORT_ADJECTIVES = [
    # Konditionelle Fähigkeiten
    {
        "word": "ausdauernd",
        "explanation": "Du kannst lange durchhalten, ohne müde zu werden.",
        "example": "Ich kann lange laufen, ohne schnell aus der Puste zu kommen.",
    },
    {
        "word": "schnell",
        "explanation": "Du reagierst und bewegst dich rasch.",
        "example": "Ich bin oft als Erstes beim Ball oder an der Ziellinie.",
    },
    {
        "word": "kraftvoll",
        "explanation": "Du hast körperliche Stärke und kannst sie einsetzen.",
        "example": "Ich kann schwere Gewichte heben oder kräftig werfen.",
    },
    {
        "word": "beweglich",
        "explanation": "Dein Körper ist dehnbar und flexibel.",
        "example": "Ich kann mich gut dehnen und habe einen grossen Bewegungsradius.",
    },
    {
        "word": "explosiv",
        "explanation": "Du kannst in kurzer Zeit viel Kraft freisetzen.",
        "example": "Ich kann hoch springen oder schnell ansprinten.",
    },
    {
        "word": "energiegeladen",
        "explanation": "Du hast viel Energie und Power.",
        "example": "Ich bin voller Tatendrang und kann lange aktiv sein.",
    },
    {
        "word": "sprintstark",
        "explanation": "Du kannst kurze Strecken sehr schnell laufen.",
        "example": "Auf kurze Distanz bin ich kaum zu schlagen.",
    },
    {
        "word": "widerstandsfähig",
        "explanation": "Du erholst dich schnell und bist robust.",
        "example": "Nach einer Anstrengung bin ich schnell wieder fit.",
    },
    # Koordinative Fähigkeiten
    {
        "word": "koordiniert",
        "explanation": "Du steuerst deine Bewegungen präzise und abgestimmt.",
        "example": "Ich kann mehrere Bewegungen gleichzeitig gut ausführen.",
    },
    {
        "word": "geschickt",
        "explanation": "Du beherrschst Bewegungen technisch gut.",
        "example": "Neue Bewegungsabläufe lerne ich relativ schnell.",
    },
    {
        "word": "reaktionsschnell",
        "explanation": "Du reagierst blitzschnell auf Situationen.",
        "example": "Ich erkenne früh, was passiert, und handle sofort.",
    },
    {
        "word": "rhythmusgefühl",
        "explanation": "Du bewegst dich rhythmisch und im Takt.",
        "example": "Ich kann Bewegungen gut an einen Rhythmus anpassen.",
    },
    {
        "word": "gleichgewichtsstark",
        "explanation": "Du behältst auch in schwierigen Situationen das Gleichgewicht.",
        "example": "Ich stehe sicher, auch wenn es wackelig wird.",
    },
    {
        "word": "wendig",
        "explanation": "Du kannst schnell die Richtung ändern.",
        "example": "Ich kann Gegner umdribbeln oder schnell ausweichen.",
    },
    {
        "word": "ballsicher",
        "explanation": "Du gehst sicher mit Bällen um.",
        "example": "Ich kann Bälle gut fangen, passen und führen.",
    },
    {
        "word": "präzise",
        "explanation": "Du triffst genau, wohin du zielst.",
        "example": "Meine Würfe, Schüsse oder Pässe sind meist genau.",
    },
    # Sportintelligenz
    {
        "word": "spielintelligent",
        "explanation": "Du verstehst Spielsituationen und handelst klug.",
        "example": "Ich sehe, wo Lücken sind, und nutze sie.",
    },
    {
        "word": "taktisch",
        "explanation": "Du denkst strategisch und planst voraus.",
        "example": "Ich überlege mir vorher, wie ich am besten vorgehe.",
    },
    {
        "word": "vorausschauend",
        "explanation": "Du erkennst, was als Nächstes passiert.",
        "example": "Ich ahne die Spielzüge des Gegners und reagiere früh.",
    },
    {
        "word": "übersicht",
        "explanation": "Du behältst den Überblick im Spiel.",
        "example": "Ich sehe alle Mitspieler und weiss, wo Platz ist.",
    },
    {
        "word": "lernfähig",
        "explanation": "Du nimmst Feedback auf und verbesserst dich.",
        "example": "Ich setze Tipps vom Trainer schnell um.",
    },
    {
        "word": "kreativ",
        "explanation": "Du findest unerwartete Lösungen im Spiel.",
        "example": "Ich überrasche mit Tricks oder neuen Spielzügen.",
    },
    {
        "word": "konzentriert",
        "explanation": "Du bleibst mental bei der Sache.",
        "example": "Auch in hektischen Momenten behalte ich den Fokus.",
    },
    {
        "word": "entscheidungsstark",
        "explanation": "Du triffst unter Druck die richtige Wahl.",
        "example": "Ich weiss schnell, ob ich passen oder schiessen soll.",
    },
    # Teamfähigkeit
    {
        "word": "teamfähig",
        "explanation": "Du arbeitest gut mit anderen zusammen.",
        "example": "Ich unterstütze mein Team und stelle mich nicht in den Vordergrund.",
    },
    {
        "word": "kommunikativ",
        "explanation": "Du sprichst dich im Team ab.",
        "example": "Ich rufe Anweisungen oder ermutige meine Mitspieler.",
    },
    {
        "word": "unterstützend",
        "explanation": "Du hilfst deinen Teammitgliedern.",
        "example": "Ich springe ein, wenn jemand Hilfe braucht.",
    },
    {
        "word": "verlässlich",
        "explanation": "Dein Team kann sich auf dich verlassen.",
        "example": "Ich bin pünktlich beim Training und gebe immer mein Bestes.",
    },
    {
        "word": "fair",
        "explanation": "Du spielst nach den Regeln und respektierst andere.",
        "example": "Ich gratuliere dem Gegner und akzeptiere Schiedsrichterentscheide.",
    },
    {
        "word": "motivierend",
        "explanation": "Du feuerst andere an und hebst die Stimmung.",
        "example": "Ich ermutige mein Team, besonders wenn es schwierig wird.",
    },
    {
        "word": "führungsstark",
        "explanation": "Du übernimmst Verantwortung und leitest andere an.",
        "example": "Ich gebe Anweisungen und organisiere das Team.",
    },
    {
        "word": "anpassungsfähig",
        "explanation": "Du passt dich verschiedenen Rollen und Situationen an.",
        "example": "Ich spiele auf verschiedenen Positionen, wenn es das Team braucht.",
    },
    # Persönliche Eigenschaften
    {
        "word": "ehrgeizig",
        "explanation": "Du willst dich ständig verbessern und gewinnen.",
        "example": "Ich trainiere extra, um besser zu werden.",
    },
    {
        "word": "diszipliniert",
        "explanation": "Du hältst dich an Regeln und Trainingspläne.",
        "example": "Ich trainiere regelmässig, auch wenn ich keine Lust habe.",
    },
    {
        "word": "mental stark",
        "explanation": "Du bleibst auch unter Druck positiv und fokussiert.",
        "example": "Auch bei Rückstand gebe ich nicht auf.",
    },
    {
        "word": "selbstbewusst",
        "explanation": "Du glaubst an deine Fähigkeiten.",
        "example": "Ich traue mir auch schwierige Aktionen zu.",
    },
    {
        "word": "kämpferisch",
        "explanation": "Du gibst niemals auf und kämpfst bis zum Schluss.",
        "example": "Ich hole auch verlorene Bälle und gebe Gas bis zum Ende.",
    },
    {
        "word": "belastbar",
        "explanation": "Du kannst mit Druck und Niederlagen umgehen.",
        "example": "Nach einer Niederlage stehe ich wieder auf und mache weiter.",
    },
    {
        "word": "geduldig",
        "explanation": "Du wartest auf deine Chance und bleibst ruhig.",
        "example": "Ich warte auf den richtigen Moment, statt überstürzt zu handeln.",
    },
    {
        "word": "leidenschaftlich",
        "explanation": "Du liebst deinen Sport und brennst dafür.",
        "example": "Sport ist für mich mehr als nur ein Hobby.",
    },
]

# Selbstkompetenz list with 40 adjectives
SELBSTKOMPETENZ_ADJECTIVES = [
    {
        "word": "selbstbewusst",
        "explanation": "Du kennst deine Stärken und trittst sicher auf.",
        "example": "Ich weiss, was ich gut kann, und zeige das auch.",
    },
    {
        "word": "selbstreflektiert",
        "explanation": "Du denkst regelmässig über dich selbst nach.",
        "example": "Ich überlege, warum ich so reagiert habe, und lerne daraus.",
    },
    {
        "word": "selbstständig",
        "explanation": "Du kannst Aufgaben eigenständig erledigen.",
        "example": "Ich brauche nicht ständig Anleitung und handle selbst.",
    },
    {
        "word": "selbstdiszipliniert",
        "explanation": "Du kannst dich selbst motivieren und kontrollieren.",
        "example": "Ich arbeite auch ohne Aufsicht konzentriert weiter.",
    },
    {
        "word": "selbstkritisch",
        "explanation": "Du erkennst eigene Schwächen und Fehler.",
        "example": "Ich sehe, wo ich mich verbessern muss, und arbeite daran.",
    },
    {
        "word": "selbstorganisiert",
        "explanation": "Du planst und strukturierst deinen Alltag selbst.",
        "example": "Ich erstelle To-do-Listen und halte meine Termine ein.",
    },
    {
        "word": "selbstverantwortlich",
        "explanation": "Du übernimmst Verantwortung für dein Handeln.",
        "example": "Ich stehe zu meinen Entscheidungen und ihren Konsequenzen.",
    },
    {
        "word": "selbstwirksam",
        "explanation": "Du glaubst daran, Dinge beeinflussen zu können.",
        "example": "Ich weiss, dass mein Einsatz einen Unterschied macht.",
    },
    {
        "word": "resilient",
        "explanation": "Du erholst dich von Rückschlägen und bleibst stark.",
        "example": "Nach einem Misserfolg stehe ich wieder auf und mache weiter.",
    },
    {
        "word": "lernbereit",
        "explanation": "Du bist offen für neues Wissen und Erfahrungen.",
        "example": "Ich sehe Fehler als Lernchance und will mich verbessern.",
    },
    {
        "word": "zielorientiert",
        "explanation": "Du setzt dir Ziele und arbeitest darauf hin.",
        "example": "Ich weiss, was ich erreichen will, und plane die Schritte.",
    },
    {
        "word": "motiviert",
        "explanation": "Du hast Antrieb und Begeisterung für Aufgaben.",
        "example": "Ich gehe Herausforderungen mit Energie und Freude an.",
    },
    {
        "word": "ausdauernd",
        "explanation": "Du bleibst dran, auch wenn es schwierig wird.",
        "example": "Ich gebe nicht auf, bis ich mein Ziel erreicht habe.",
    },
    {
        "word": "geduldig",
        "explanation": "Du akzeptierst, dass manche Dinge Zeit brauchen.",
        "example": "Ich erwarte keine sofortigen Ergebnisse und bleibe dran.",
    },
    {
        "word": "entscheidungsfreudig",
        "explanation": "Du triffst Entscheidungen und stehst dazu.",
        "example": "Ich wäge ab, entscheide mich und handle dann.",
    },
    {
        "word": "mutig",
        "explanation": "Du traust dich, neue Wege zu gehen.",
        "example": "Ich wage auch Dinge, bei denen ich unsicher bin.",
    },
    {
        "word": "ehrlich",
        "explanation": "Du bist aufrichtig zu dir selbst und anderen.",
        "example": "Ich mache mir nichts vor und sage die Wahrheit.",
    },
    {
        "word": "authentisch",
        "explanation": "Du bleibst dir selbst treu und verstellt dich nicht.",
        "example": "Ich zeige mich so, wie ich wirklich bin.",
    },
    {
        "word": "stressresistent",
        "explanation": "Du bleibst auch unter Druck handlungsfähig.",
        "example": "In hektischen Situationen bewahre ich einen kühlen Kopf.",
    },
    {
        "word": "gelassen",
        "explanation": "Du bleibst ruhig, auch wenn es turbulent wird.",
        "example": "Bei Problemen rege ich mich nicht sofort auf.",
    },
    {
        "word": "optimistisch",
        "explanation": "Du siehst das Positive und glaubst an gute Ergebnisse.",
        "example": "Ich gehe davon aus, dass es gut kommen wird.",
    },
    {
        "word": "realistisch",
        "explanation": "Du schätzt dich und Situationen nüchtern ein.",
        "example": "Ich weiss, was machbar ist, und setze mir erreichbare Ziele.",
    },
    {
        "word": "flexibel",
        "explanation": "Du passt dich neuen Situationen an.",
        "example": "Wenn sich etwas ändert, stelle ich mich darauf ein.",
    },
    {
        "word": "neugierig",
        "explanation": "Du interessierst dich für Neues und willst lernen.",
        "example": "Ich frage nach und will verstehen, wie Dinge funktionieren.",
    },
    {
        "word": "kreativ",
        "explanation": "Du findest eigene Lösungen und Ideen.",
        "example": "Ich denke um die Ecke und finde alternative Wege.",
    },
    {
        "word": "analytisch",
        "explanation": "Du zerlegst Probleme und verstehst Zusammenhänge.",
        "example": "Ich schaue genau hin und verstehe, was dahintersteckt.",
    },
    {
        "word": "fokussiert",
        "explanation": "Du konzentrierst dich auf das Wesentliche.",
        "example": "Ich lasse mich nicht ablenken und bleibe bei der Sache.",
    },
    {
        "word": "strukturiert",
        "explanation": "Du gehst systematisch und ordentlich vor.",
        "example": "Ich mache zuerst einen Plan, bevor ich loslege.",
    },
    {
        "word": "eigeninitiativ",
        "explanation": "Du handelst aus eigenem Antrieb.",
        "example": "Ich warte nicht auf Anweisungen, sondern ergreife selbst die Initiative.",
    },
    {
        "word": "gewissenhaft",
        "explanation": "Du arbeitest sorgfältig und zuverlässig.",
        "example": "Aufgaben erledige ich vollständig und gründlich.",
    },
    {
        "word": "pflichtbewusst",
        "explanation": "Du nimmst deine Aufgaben und Pflichten ernst.",
        "example": "Was ich übernehme, erledige ich auch.",
    },
    {
        "word": "leistungsbereit",
        "explanation": "Du bist bereit, dich anzustrengen.",
        "example": "Ich gebe mein Bestes und scheue keine Mühe.",
    },
    {
        "word": "ambitioniert",
        "explanation": "Du hast hohe Ziele und willst etwas erreichen.",
        "example": "Ich strebe nach mehr und gebe mich nicht mit wenig zufrieden.",
    },
    {
        "word": "proaktiv",
        "explanation": "Du handelst vorausschauend und vorbeugend.",
        "example": "Ich erkenne Probleme früh und handle, bevor es zu spät ist.",
    },
    {
        "word": "besonnen",
        "explanation": "Du überlegst erst, bevor du handelst.",
        "example": "Ich handle nicht impulsiv, sondern denke vorher nach.",
    },
    {
        "word": "ausgeglichen",
        "explanation": "Du bist emotional stabil und im Gleichgewicht.",
        "example": "Ich lasse mich nicht so schnell aus der Ruhe bringen.",
    },
    {
        "word": "anpassungsfähig",
        "explanation": "Du kommst mit Veränderungen gut zurecht.",
        "example": "Neue Situationen machen mir keine Angst.",
    },
    {
        "word": "unabhängig",
        "explanation": "Du bildest dir eigene Meinungen und handelst selbst.",
        "example": "Ich lasse mich nicht von anderen unter Druck setzen.",
    },
    {
        "word": "belastbar",
        "explanation": "Du hältst auch in schwierigen Phasen durch.",
        "example": "Auch bei viel Arbeit behalte ich den Überblick.",
    },
    {
        "word": "bewusst",
        "explanation": "Du achtest auf deine Gedanken, Gefühle und Handlungen.",
        "example": "Ich nehme wahr, wie ich mich fühle und warum.",
    },
]

# Sozialkompetenz list with 40 adjectives
SOZIALKOMPETENZ_ADJECTIVES = [
    {
        "word": "teamfähig",
        "explanation": "Du arbeitest gut mit anderen zusammen.",
        "example": "In der Gruppe übernehme ich meinen Teil und helfe anderen.",
    },
    {
        "word": "kommunikativ",
        "explanation": "Du drückst dich klar aus und hörst zu.",
        "example": "Ich kann meine Gedanken verständlich erklären.",
    },
    {
        "word": "empathisch",
        "explanation": "Du verstehst und teilst die Gefühle anderer.",
        "example": "Ich merke, wenn es jemandem nicht gut geht, und frage nach.",
    },
    {
        "word": "hilfsbereit",
        "explanation": "Du unterstützt andere gerne.",
        "example": "Ich helfe, wenn jemand Schwierigkeiten hat.",
    },
    {
        "word": "respektvoll",
        "explanation": "Du behandelst andere mit Achtung und Würde.",
        "example": "Ich lasse andere ausreden und werte niemanden ab.",
    },
    {
        "word": "freundlich",
        "explanation": "Du gehst nett und herzlich mit anderen um.",
        "example": "Ich grüsse und lächle, auch Fremde.",
    },
    {
        "word": "tolerant",
        "explanation": "Du akzeptierst andere, auch wenn sie anders sind.",
        "example": "Ich respektiere verschiedene Meinungen und Lebensweisen.",
    },
    {
        "word": "fair",
        "explanation": "Du behandelst alle gleich und gerecht.",
        "example": "Ich halte mich an Abmachungen und bevorzuge niemanden.",
    },
    {
        "word": "kooperativ",
        "explanation": "Du arbeitest gerne mit anderen zusammen.",
        "example": "Ich suche nach Lösungen, die für alle passen.",
    },
    {
        "word": "konfliktfähig",
        "explanation": "Du kannst Konflikte sachlich ansprechen und lösen.",
        "example": "Bei Streit spreche ich das Problem ruhig an.",
    },
    {
        "word": "diplomatisch",
        "explanation": "Du vermittelst geschickt zwischen verschiedenen Seiten.",
        "example": "Ich finde Kompromisse und bringe Leute zusammen.",
    },
    {
        "word": "kompromissbereit",
        "explanation": "Du bist bereit, Zugeständnisse zu machen.",
        "example": "Ich bestehe nicht immer auf meiner Meinung.",
    },
    {
        "word": "verlässlich",
        "explanation": "Man kann sich auf dich verlassen.",
        "example": "Was ich verspreche, halte ich auch ein.",
    },
    {
        "word": "loyal",
        "explanation": "Du stehst zu deinen Freunden und deinem Team.",
        "example": "Ich halte zu meinen Leuten, auch in schwierigen Zeiten.",
    },
    {
        "word": "vertrauenswürdig",
        "explanation": "Man kann dir Geheimnisse anvertrauen.",
        "example": "Was mir jemand im Vertrauen erzählt, behalte ich für mich.",
    },
    {
        "word": "aufmerksam",
        "explanation": "Du bemerkst, was andere brauchen oder fühlen.",
        "example": "Ich sehe, wenn jemand Hilfe braucht oder schlecht drauf ist.",
    },
    {
        "word": "wertschätzend",
        "explanation": "Du zeigst anderen, dass du sie schätzt.",
        "example": "Ich sage Danke und mache Komplimente, wenn sie verdient sind.",
    },
    {
        "word": "offen",
        "explanation": "Du bist zugänglich und interessierst dich für andere.",
        "example": "Ich gehe auf neue Leute zu und stelle Fragen.",
    },
    {
        "word": "höflich",
        "explanation": "Du verhältst dich anständig und respektvoll.",
        "example": "Ich sage 'bitte' und 'danke' und halte Türen auf.",
    },
    {
        "word": "geduldig",
        "explanation": "Du nimmst dir Zeit für andere.",
        "example": "Ich erkläre etwas mehrmals, wenn jemand es nicht versteht.",
    },
    {
        "word": "verständnisvoll",
        "explanation": "Du versuchst, andere zu verstehen.",
        "example": "Bevor ich urteile, frage ich nach den Gründen.",
    },
    {
        "word": "rücksichtsvoll",
        "explanation": "Du denkst an die Bedürfnisse anderer.",
        "example": "Ich bin leise, wenn andere arbeiten oder schlafen.",
    },
    {
        "word": "einfühlsam",
        "explanation": "Du gehst sensibel mit den Gefühlen anderer um.",
        "example": "Ich tröste jemanden, der traurig ist, und höre zu.",
    },
    {
        "word": "kontaktfreudig",
        "explanation": "Du gehst gerne auf Menschen zu.",
        "example": "Ich komme leicht mit neuen Leuten ins Gespräch.",
    },
    {
        "word": "integrativ",
        "explanation": "Du beziehst andere mit ein und schliesst niemanden aus.",
        "example": "Ich lade auch Aussenseiter ein mitzumachen.",
    },
    {
        "word": "motivierend",
        "explanation": "Du ermutigst und begeisterst andere.",
        "example": "Ich feuere andere an und mache ihnen Mut.",
    },
    {
        "word": "inspirierend",
        "explanation": "Du gibst anderen Ideen und Anstösse.",
        "example": "Meine Ideen regen andere zum Nachdenken an.",
    },
    {
        "word": "führungsstark",
        "explanation": "Du kannst eine Gruppe leiten und organisieren.",
        "example": "Ich übernehme die Leitung und koordiniere das Team.",
    },
    {
        "word": "verantwortungsbewusst",
        "explanation": "Du übernimmst Verantwortung für die Gruppe.",
        "example": "Ich achte darauf, dass alle mitkommen und niemand zurückbleibt.",
    },
    {
        "word": "kritikfähig",
        "explanation": "Du gibst und nimmst Kritik konstruktiv.",
        "example": "Ich sage ehrlich meine Meinung, ohne zu verletzen.",
    },
    {
        "word": "versöhnlich",
        "explanation": "Du kannst nach Streit wieder aufeinander zugehen.",
        "example": "Nach einem Konflikt biete ich an, die Sache zu klären.",
    },
    {
        "word": "dankbar",
        "explanation": "Du erkennst an, was andere für dich tun.",
        "example": "Ich sage Danke und zeige, dass ich Hilfe schätze.",
    },
    {
        "word": "grosszügig",
        "explanation": "Du teilst gerne und gibst ohne zu zögern.",
        "example": "Ich teile mein Essen oder helfe ohne Gegenleistung.",
    },
    {
        "word": "bescheiden",
        "explanation": "Du stellst dich nicht in den Vordergrund.",
        "example": "Ich prahle nicht mit meinen Erfolgen.",
    },
    {
        "word": "authentisch",
        "explanation": "Du bist echt und verstellt dich nicht in Gruppen.",
        "example": "Ich bleibe mir selbst treu, auch wenn andere anders denken.",
    },
    {
        "word": "zugänglich",
        "explanation": "Andere können leicht mit dir ins Gespräch kommen.",
        "example": "Ich wirke nicht abweisend und höre zu, wenn jemand kommt.",
    },
    {
        "word": "vermittelnd",
        "explanation": "Du hilfst, Missverständnisse zu klären.",
        "example": "Bei Streit versuche ich, beide Seiten zu verstehen.",
    },
    {
        "word": "unterstützend",
        "explanation": "Du stärkst anderen den Rücken.",
        "example": "Ich helfe anderen, ihre Ziele zu erreichen.",
    },
    {
        "word": "verbindend",
        "explanation": "Du bringst Menschen zusammen.",
        "example": "Ich stelle Leute vor, die sich noch nicht kennen.",
    },
    {
        "word": "einbeziehend",
        "explanation": "Du achtest darauf, dass alle mitmachen können.",
        "example": "Bei Gruppenarbeiten frage ich auch die Stillen nach ihrer Meinung.",
    },
]

# Metadata for all premium lists
PREMIUM_LISTS = [
    {
        "name": "Grosse Liste",
        "slug": "grosse-liste",
        "description": "Erweiterte Liste mit 50 Adjektiven für eine umfassendere Selbstreflexion",
        "adjectives": GROSSE_LISTE_ADJECTIVES,
    },
    {
        "name": "Sport",
        "slug": "sport",
        "description": "40 Adjektive zu sportlichen Fähigkeiten: Kondition, Koordination, Sportintelligenz, Teamfähigkeit und persönliche Eigenschaften",
        "adjectives": SPORT_ADJECTIVES,
    },
    {
        "name": "Selbstkompetenz",
        "slug": "selbstkompetenz",
        "description": "40 Adjektive zur Selbstkompetenz: Selbstbewusstsein, Selbstorganisation, Resilienz und persönliche Entwicklung",
        "adjectives": SELBSTKOMPETENZ_ADJECTIVES,
    },
    {
        "name": "Sozialkompetenz",
        "slug": "sozialkompetenz",
        "description": "40 Adjektive zur Sozialkompetenz: Teamarbeit, Kommunikation, Empathie und zwischenmenschliche Fähigkeiten",
        "adjectives": SOZIALKOMPETENZ_ADJECTIVES,
    },
]
