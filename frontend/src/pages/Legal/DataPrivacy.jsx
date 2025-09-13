import { useNavigate } from "react-router";

const DataPrivacy = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "48px 24px", maxWidth: 700, margin: "0 auto" }}>
      <h1>Privacy Policy / Datenschutzerklärung</h1>
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
          margin: "16px 0 32px 0",
          transition: "background 0.2s",
        }}
        onClick={() => navigate(-1)}
      >
        ← Back / Zurück
      </button>

      {/* ---------- ENGLISH VERSION ---------- */}
      <h2>1. General</h2>
      <p>
        HelloDev.social (“HelloDev”, “we”, “our”, “us”) is a social network
        built by developers for developers. This platform is a final project of
        the <strong>DCI – Digital Career Institute</strong>. It is intended as a
        functioning project prototype and <strong>not</strong> as a commercial,
        production-ready or permanently maintained service. We take the
        protection of your personal data very seriously and process it strictly
        in accordance with the EU General Data Protection Regulation (GDPR).
      </p>

      <h2>2. Data We Collect and Process</h2>
      <ul>
        <li>
          <strong>Account data:</strong> username, email address, and optional
          sign-in via GitHub or Google.
        </li>
        <li>
          <strong>Profile data:</strong> skills, tech stack, short bio,
          location/time zone (if provided), and your pixel-style profile
          picture.
        </li>
        <li>
          <strong>Content data:</strong> posts, comments, likes, and public
          messages that you choose to publish.
        </li>
        <li>
          <strong>Communication data:</strong> private chats and direct
          messages, which are end-to-end encrypted and cannot be read by us.
        </li>
        <li>
          <strong>Technical data:</strong> browser type, IP address (short-term
          stored for security/logging), and basic usage statistics.
        </li>
      </ul>

      <h2>3. Purpose and Legal Basis</h2>
      <p>
        We process your data to provide and demonstrate the functions of this
        educational project (Art. 6 (1)(b) GDPR), maintain security and prevent
        abuse (Art. 6 (1)(f) GDPR), and fulfill legal obligations (Art. 6 (1)(c)
        GDPR). The collected data is used exclusively within the framework of
        this prototype and not for commercial exploitation.
      </p>

      <h2>4. Visibility and Sharing</h2>
      <p>
        Your full profile is visible only to users with whom you have either
        sent or accepted a friendship or match request. Publicly posted
        messages, your chosen display name, and your listed tech stack can be
        visible to all users. Your profile picture is intentionally limited to
        low-resolution pixel art (16×16 or 32×32 px) and can be edited or
        anonymized by you at any time.
      </p>

      <h2>5. Security</h2>
      <p>
        Passwords are stored as cryptographic hashes (bcrypt/argon2). Private
        chat messages are end-to-end encrypted. Data is stored in secure
        databases within the EU/EEA and is only accessible to authorized team
        members on a need-to-know basis.
      </p>

      <h2>6. Deletion of Your Account</h2>
      <p>
        You can delete your account at any time via the <strong>Settings</strong>
        section of the website. When you confirm deletion, all personal user
        data—including profile information, private messages, and any associated
        content—will be <strong>permanently and irreversibly removed</strong>
        from our databases within a short period. Deleted data cannot be
        recovered.
      </p>

      <h2>7. Your Rights</h2>
      <p>
        You have the right to access, correct, export, restrict processing, or
        delete your personal data at any time, as well as the right to lodge a
        complaint with a supervisory authority (Art. 15-21 GDPR).
      </p>

      <h2>8. Data Retention</h2>
      <p>
        We retain personal data only as long as necessary for demonstrating this
        project or as required by law. When you delete your account, your data
        is permanently erased as described above, unless legal retention
        obligations apply.
      </p>

      <h2>9. Contact</h2>
      <p>
        For privacy questions or to exercise your rights, please reach out to
        the HelloDev team through our GitHub project page:{" "}
        <a
          href="https://github.com/Merge-Pray/HelloDev"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://github.com/Merge-Pray/HelloDev
        </a>.  
        Our team members and their GitHub profiles are listed there and provide
        the appropriate contact channels.
      </p>

      {/* ---------- DEUTSCHE VERSION ---------- */}
      <h2>Datenschutzerklärung (Deutsch)</h2>
      <h3>1. Allgemeines</h3>
      <p>
        HelloDev.social („HelloDev“, „wir“) ist ein soziales Netzwerk von
        Entwicklern für Entwickler. Diese Plattform ist ein{" "}
        <strong>Abschlussprojekt des DCI – Digital Career Institute</strong>.
        Sie dient als funktionierende Projektskizze und{" "}
        <strong>nicht</strong> als kommerzieller, produktiver oder dauerhaft
        betriebener Dienst. Wir verarbeiten Ihre personenbezogenen Daten
        ausschließlich gemäß der Datenschutz-Grundverordnung (DSGVO).
      </p>

      <h3>2. Erhobene und verarbeitete Daten</h3>
      <ul>
        <li>
          <strong>Kontodaten:</strong> Benutzername, E-Mail-Adresse und
          optionale Anmeldung über GitHub oder Google.
        </li>
        <li>
          <strong>Profildaten:</strong> Skills, Tech-Stack, Kurzbiografie,
          Standort/Zeitzone (falls angegeben) sowie Ihr Pixel-Profilbild.
        </li>
        <li>
          <strong>Inhaltsdaten:</strong> Beiträge, Kommentare, Likes und von
          Ihnen veröffentlichte öffentliche Nachrichten.
        </li>
        <li>
          <strong>Kommunikationsdaten:</strong> Private Chats und
          Direktnachrichten, die Ende-zu-Ende verschlüsselt sind und von uns
          nicht gelesen werden können.
        </li>
        <li>
          <strong>Technische Daten:</strong> Browsertyp, IP-Adresse
          (kurzfristig zu Sicherheits-/Logzwecken gespeichert) und
          Nutzungsstatistiken.
        </li>
      </ul>

      <h3>3. Zweck und Rechtsgrundlage</h3>
      <p>
        Wir verarbeiten Ihre Daten zur Bereitstellung und Demonstration der
        Funktionen dieses Ausbildungsprojekts (Art. 6 Abs. 1 b DSGVO), zur
        Gewährleistung der Sicherheit und zur Missbrauchsverhinderung (Art. 6
        Abs. 1 f DSGVO) sowie zur Erfüllung gesetzlicher Pflichten (Art. 6 Abs.
        1 c DSGVO). Die erhobenen Daten werden ausschließlich im Rahmen dieses
        Prototyps und nicht zu kommerziellen Zwecken genutzt.
      </p>

      <h3>4. Sichtbarkeit und Weitergabe</h3>
      <p>
        Ihr vollständiges Profil ist nur für Nutzer sichtbar, denen Sie eine
        Freundschafts- oder Matchanfrage gesendet oder deren Anfrage Sie
        angenommen haben. Öffentlich gepostete Nachrichten, Ihr Anzeigename und
        Ihr Tech-Stack können für alle Nutzer sichtbar sein. Ihr Profilbild ist
        absichtlich auf 16×16 oder 32×32 Pixel reduziert und kann jederzeit von
        Ihnen bearbeitet oder anonymisiert werden.
      </p>

      <h3>5. Sicherheit</h3>
      <p>
        Passwörter werden als kryptographische Hashes (bcrypt/argon2)
        gespeichert. Private Chat-Nachrichten sind Ende-zu-Ende verschlüsselt.
        Die Daten werden auf sicheren Servern innerhalb der EU/EWR gespeichert
        und sind nur für befugte Teammitglieder mit Bedarf zugänglich.
      </p>

      <h3>6. Löschung Ihres Kontos</h3>
      <p>
        Sie können Ihr Konto jederzeit über den Bereich{" "}
        <strong>Settings/Einstellungen</strong> der Website löschen. Nach
        Bestätigung der Löschung werden sämtliche personenbezogenen Daten – einschließlich
        Profildaten, privater Nachrichten und sämtlicher zugehöriger Inhalte –
        <strong>unwiderruflich und endgültig</strong> aus unseren Datenbanken
        entfernt. Gelöschte Daten können nicht wiederhergestellt werden.
      </p>

      <h3>7. Ihre Rechte</h3>
      <p>
        Sie haben das Recht auf Auskunft, Berichtigung, Übertragbarkeit,
        Einschränkung der Verarbeitung sowie Löschung Ihrer personenbezogenen
        Daten sowie das Recht, sich bei einer Aufsichtsbehörde zu beschweren
        (Art. 15-21 DSGVO).
      </p>

      <h3>8. Speicherdauer</h3>
      <p>
        Wir speichern personenbezogene Daten nur so lange, wie es für die
        Demonstration dieses Projekts oder aufgrund gesetzlicher Vorgaben
        erforderlich ist. Nach Löschung Ihres Kontos werden die Daten wie oben
        beschrieben endgültig gelöscht, soweit keine gesetzlichen
        Aufbewahrungspflichten bestehen.
      </p>

      <h3>9. Kontakt</h3>
      <p>
        Für Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte können Sie
        uns über unsere GitHub-Projektseite erreichen:{" "}
        <a
          href="https://github.com/Merge-Pray/HelloDev"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://github.com/Merge-Pray/HelloDev
        </a>.  
        Dort finden Sie die Teammitglieder und deren GitHub-Profile mit den
        entsprechenden Kontaktmöglichkeiten.
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

export default DataPrivacy;