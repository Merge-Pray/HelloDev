import { useNavigate } from "react-router";

const GeneralTermsandConditions = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "48px 24px", maxWidth: 700, margin: "0 auto" }}>
      <h1>Terms & Conditions / Allgemeine Nutzungsbedingungen</h1>

      {/* ---------- ENGLISH VERSION ---------- */}
      <h2>1. Purpose and Scope</h2>
      <p>
        HelloDev.social (“HelloDev”, “we”) is a developer community platform created as a
        final project of the <strong>DCI – Digital Career Institute</strong>. The platform
        is a functioning project prototype, intended for educational and collaborative purposes
        only. It is <strong>not</strong> a commercial, production-grade, or permanently
        maintained service.
      </p>

      <h2>2. Acceptance of Terms</h2>
      <p>
        By accessing or using HelloDev, you agree to these Terms & Conditions and our
        Community Guidelines. If you do not agree, you must not use the platform.
      </p>

      <h2>3. Community Guidelines</h2>
      <ul>
        <li>
          <strong>Respectful conduct:</strong> Be professional and courteous. Discrimination,
          harassment, hate speech, or threats have no place here.
        </li>
        <li>
          <strong>No glorification of violence or illegal activity:</strong> Do not post content
          that promotes, incites, or instructs violence, self-harm, or unlawful acts.
        </li>
        <li>
          <strong>Constructive collaboration:</strong> Feedback should be specific, helpful,
          and focused on code, projects, and ideas—not on the person.
        </li>
        <li>
          <strong>Privacy:</strong> Do not share private or personal data of others without
          clear permission.
        </li>
        <li>
          <strong>Intellectual property:</strong> Only share content you own or are authorized
          to share; credit sources appropriately.
        </li>
      </ul>

      <h2>4. Prohibited Content and Behaviour</h2>
      <ul>
        <li>Hate speech, harassment, bullying, or targeted intimidation.</li>
        <li>Violent, extremist, or terrorist content, or its praise/advocacy.</li>
        <li>Illegal content or instructions that facilitate illegal acts.</li>
        <li>Sexually explicit content or exploitation.</li>
        <li>Spam, scams, malicious software, or attempts to compromise security.</li>
        <li>Impersonation or misrepresentation of identity or affiliation.</li>
      </ul>

      <h2>5. Moderation and Enforcement</h2>
      <p>
        We may review, restrict, or remove content and may suspend or permanently delete accounts
        that violate these terms or our guidelines. <strong>Administrators reserve the right to
        delete your account</strong> at their reasonable discretion, particularly in cases of
        severe or repeated violations. We aim for a balanced, fair approach and may warn,
        temporarily restrict, or immediately act depending on severity and context.
      </p>

      <h2>6. Reporting</h2>
      <p>
        If you encounter violations, please report them via the project’s GitHub page:
        <a
          href="https://github.com/Merge-Pray/HelloDev"
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}https://github.com/Merge-Pray/HelloDev
        </a>. We will review reports in good faith and take appropriate measures.
      </p>

      <h2>7. Account Management and Deletion</h2>
      <p>
        You can delete your account at any time in <strong>Settings</strong>. Upon confirmation,
        your personal user data is <strong>permanently and irreversibly deleted</strong> from our
        databases, subject to any legal retention requirements. Deleted data cannot be recovered.
      </p>

      <h2>8. Intellectual Property and License</h2>
      <p>
        You retain rights to content you submit. By posting on HelloDev, you grant us a
        non-exclusive, worldwide, royalty-free license to host, display, and transmit your
        content solely to operate and demonstrate the platform’s functionality.
      </p>

      <h2>9. Disclaimer and Limitation of Liability</h2>
      <p>
        HelloDev is provided “as is” without warranties of any kind, including availability,
        accuracy, or fitness for a particular purpose. To the maximum extent permitted by law,
        we are not liable for any indirect, incidental, or consequential damages arising from
        the use of the platform.
      </p>

      <h2>10. Privacy</h2>
      <p>
        Our processing of personal data is described in the Privacy Policy / Datenschutzerklärung.
        Please review it for details on encryption, visibility, and deletion of data.
      </p>

      <h2>11. Changes to These Terms</h2>
      <p>
        We may update these Terms to reflect improvements or legal requirements. Material changes
        will be indicated on the platform; continued use after changes constitutes acceptance.
      </p>

      <h2>12. Contact</h2>
      <p>
        For questions about these Terms or moderation, please contact us via our GitHub project page:
        <a
          href="https://github.com/Merge-Pray/HelloDev"
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}https://github.com/Merge-Pray/HelloDev
        </a>.
      </p>

      {/* ---------- DEUTSCHE VERSION ---------- */}
      <h2>Allgemeine Nutzungsbedingungen (Deutsch)</h2>

      <h3>1. Zweck und Geltungsbereich</h3>
      <p>
        HelloDev.social („HelloDev“, „wir“) ist eine Entwickler-Community, erstellt als
        Abschlussprojekt des <strong>DCI – Digital Career Institute</strong>. Die Plattform
        ist eine funktionierende Projektskizze und ausschließlich für Ausbildungs- und
        Kollaborationszwecke gedacht. Sie ist <strong>kein</strong> kommerzieller,
        produktiver oder dauerhaft betriebener Dienst.
      </p>

      <h3>2. Zustimmung zu den Bedingungen</h3>
      <p>
        Durch Zugriff auf oder Nutzung von HelloDev stimmen Sie diesen Nutzungsbedingungen
        und unseren Community-Richtlinien zu. Wenn Sie nicht einverstanden sind, dürfen Sie
        die Plattform nicht nutzen.
      </p>

      <h3>3. Community-Richtlinien</h3>
      <ul>
        <li>
          <strong>Respektvolles Verhalten:</strong> Professionell und höflich bleiben.
          Diskriminierung, Belästigung, Hassrede oder Drohungen haben hier keinen Platz.
        </li>
        <li>
          <strong>Keine Gewalt- oder Gesetzesverherrlichung:</strong> Keine Inhalte, die
          Gewalt, Selbstverletzung oder rechtswidrige Handlungen fördern, anleiten oder
          verherrlichen.
        </li>
        <li>
          <strong>Konstruktive Zusammenarbeit:</strong> Feedback sachlich, konkret und
          auf Code/Projekte/Ideen bezogen – nicht auf Personen.
        </li>
        <li>
          <strong>Privatsphäre:</strong> Keine Weitergabe privater Daten anderer ohne
          klare Einwilligung.
        </li>
        <li>
          <strong>Urheberrecht:</strong> Nur Inhalte teilen, an denen Sie Rechte haben;
          Quellen angemessen nennen.
        </li>
      </ul>

      <h3>4. Verbotene Inhalte und Verhaltensweisen</h3>
      <ul>
        <li>Hassrede, Belästigung, Mobbing oder gezielte Einschüchterung.</li>
        <li>Gewaltverherrlichende, extremistische oder terroristische Inhalte bzw. deren Lob.</li>
        <li>Illegale Inhalte oder Anleitungen zu rechtswidrigen Handlungen.</li>
        <li>Sexuell explizite Inhalte oder Ausbeutung.</li>
        <li>Spam, Betrug, Schadsoftware oder Versuche, die Sicherheit zu kompromittieren.</li>
        <li>Vortäuschung falscher Identitäten oder Zugehörigkeiten.</li>
      </ul>

      <h3>5. Moderation und Durchsetzung</h3>
      <p>
        Wir können Inhalte prüfen, einschränken oder entfernen und Konten sperren oder
        dauerhaft löschen, wenn diese Bedingungen oder Richtlinien verletzt werden.
        <strong>Administratoren behalten sich vor, Ihren Account zu löschen</strong> –
        insbesondere bei schweren oder wiederholten Verstößen. Wir handeln ausgewogen und
        verhältnismäßig und können je nach Schweregrad verwarnen, vorübergehend
        einschränken oder unmittelbar Maßnahmen ergreifen.
      </p>

      <h3>6. Meldungen</h3>
      <p>
        Bitte melden Sie Verstöße über die GitHub-Projektseite:
        <a
          href="https://github.com/Merge-Pray/HelloDev"
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}https://github.com/Merge-Pray/HelloDev
        </a>. Wir prüfen Meldungen nach bestem Wissen und ergreifen geeignete Schritte.
      </p>

      <h3>7. Kontoverwaltung und Löschung</h3>
      <p>
        Sie können Ihr Konto jederzeit unter <strong>Settings/Einstellungen</strong> löschen.
        Nach Bestätigung wird Ihre personenbezogene Nutzerdatenbasis
        <strong> dauerhaft und unwiderruflich</strong> entfernt, vorbehaltlich
        gesetzlicher Aufbewahrungspflichten. Gelöschte Daten können nicht
        wiederhergestellt werden.
      </p>

      <h3>8. Urheberrecht und Lizenz</h3>
      <p>
        Rechte an von Ihnen eingestellten Inhalten verbleiben bei Ihnen. Durch das Posten
        auf HelloDev räumen Sie uns eine nicht-exklusive, weltweite, lizenzgebührenfreie
        Lizenz ein, Ihre Inhalte zum Zwecke des Betriebs und der Demonstration der
        Plattform zu hosten, anzuzeigen und zu übertragen.
      </p>

      <h3>9. Haftungsausschluss und Haftungsbeschränkung</h3>
      <p>
        HelloDev wird „wie besehen“ bereitgestellt – ohne Gewährleistung, insbesondere
        nicht hinsichtlich Verfügbarkeit, Genauigkeit oder Eignung für einen bestimmten
        Zweck. Soweit rechtlich zulässig haften wir nicht für indirekte, zufällige oder
        Folgeschäden, die aus der Nutzung der Plattform entstehen.
      </p>

      <h3>10. Datenschutz</h3>
      <p>
        Die Verarbeitung personenbezogener Daten ist in der Datenschutzerklärung beschrieben.
        Bitte informieren Sie sich dort über Verschlüsselung, Sichtbarkeit und Löschung.
      </p>

      <h3>11. Änderungen dieser Bedingungen</h3>
      <p>
        Wir können diese Bedingungen anpassen, um Verbesserungen oder rechtliche Vorgaben
        abzubilden. Wesentliche Änderungen werden auf der Plattform kenntlich gemacht; die
        weitere Nutzung gilt als Zustimmung.
      </p>

      <h3>12. Kontakt</h3>
      <p>
        Bei Fragen zu diesen Bedingungen oder zur Moderation kontaktieren Sie uns über die
        GitHub-Projektseite:
        <a
          href="https://github.com/Merge-Pray/HelloDev"
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}https://github.com/Merge-Pray/HelloDev
        </a>.
      </p>

      <button
        style={{
          background: "var(--color-primary)",
          color: "#fff",
          border: "none",
          borderRadius: "999px",
          padding: "0.5rem 1.5rem",
          fontSize: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
          marginTop: "32px",
          transition: "background 0.2s",
        }}
        onClick={() => navigate(-1)}
      >
        ← Back / Zurück
      </button>
    </div>
  );
};

export default GeneralTermsandConditions;