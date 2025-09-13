import { useNavigate } from "react-router";

const Legalnotice = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "48px 24px", maxWidth: 700, margin: "0 auto" }}>
      <h1>Legal Notice / Impressum</h1>

      {/* ---------- ENGLISH VERSION ---------- */}
      <h2>1. Project Information</h2>
      <p>
        HelloDev.social (“HelloDev”) is a <strong>non-commercial educational
        project</strong> created by the developer team <strong>Merge &amp; Pray</strong> 
        as part of the <strong>Digital Career Institute (DCI) Web Development course
        2024 / 2025</strong>.  
        This platform is a functioning prototype for demonstration and learning
        purposes only. It is <strong>not</strong> a commercial service and
        is <strong>not intended for continuous operation or profit-making</strong>.
      </p>

      <h2>2. Responsible Team</h2>
      <p>
        Project team: <strong>Merge &amp; Pray</strong><br/>
        Course: DCI Web Development 2024 / 2025<br/>
        Germany / EU
      </p>

      <h2>3. Contact</h2>
      <p>
        For legal questions, privacy concerns, or requests related to this
        project, please use our public project repository on GitHub:{" "}
        <a
          href="https://github.com/Merge-Pray/HelloDev"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://github.com/Merge-Pray/HelloDev
        </a>.  
        Team members and their GitHub profiles are listed there and provide the
        appropriate contact channels.
      </p>

      <h2>4. Liability for Content</h2>
      <p>
        This site is provided as part of an educational exercise.
        Although we carefully develop and maintain the content,
        we make <strong>no warranties</strong> as to its completeness,
        correctness, or continuous availability.  
        As an educational prototype, HelloDev.social is not liable
        for damages arising from use or reliance on the information provided.
      </p>

      <h2>5. Copyright and Licenses</h2>
      <p>
        Unless otherwise stated, all code and content of HelloDev.social are
        published under the <strong>MIT license</strong>.  
        Third-party content (such as open-source libraries) remains under their
        respective licenses and is credited accordingly.
      </p>

      <h2>6. Governing Law</h2>
      <p>
        This project is developed in Germany. Any legal disputes that may arise
        in connection with HelloDev.social are subject to the applicable laws of
        Germany and the European Union, where relevant.
      </p>

      {/* ---------- DEUTSCHE VERSION ---------- */}
      <h2>Impressum (Deutsch)</h2>

      <h3>1. Projektinformationen</h3>
      <p>
        HelloDev.social („HelloDev“) ist ein <strong>nicht-kommerzielles
        Ausbildungsprojekt</strong>, entwickelt vom Entwicklerteam
        <strong> Merge &amp; Pray</strong> im Rahmen des
        <strong> Digital Career Institute (DCI) Web Development Kurses
        2024 / 2025</strong>.  
        Die Plattform ist eine funktionierende Projektskizze zu
        Demonstrations- und Lernzwecken.  
        Sie ist <strong>kein kommerzieller Dienst</strong> und
        <strong> nicht für einen dauerhaften Betrieb oder Gewinnerzielung bestimmt</strong>.
      </p>

      <h3>2. Verantwortliches Team</h3>
      <p>
        Projektteam: <strong>Merge &amp; Pray</strong><br/>
        Kurs: DCI Web Development 2024 / 2025<br/>
        Deutschland / EU
      </p>

      <h3>3. Kontakt</h3>
      <p>
        Für rechtliche Fragen, Datenschutzanliegen oder Anfragen im Zusammenhang
        mit diesem Projekt nutzen Sie bitte unser öffentliches
        GitHub-Repository:{" "}
        <a
          href="https://github.com/Merge-Pray/HelloDev"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://github.com/Merge-Pray/HelloDev
        </a>.  
        Dort finden Sie die Teammitglieder sowie deren GitHub-Profile mit den
        entsprechenden Kontaktmöglichkeiten.
      </p>

      <h3>4. Haftung für Inhalte</h3>
      <p>
        Diese Website ist Teil einer Ausbildung und dient ausschließlich
        Demonstrationszwecken.  
        Trotz sorgfältiger Erstellung übernehmen wir <strong> keine Gewähr </strong>
        für die Vollständigkeit, Richtigkeit oder ständige Verfügbarkeit der
        Inhalte.  
        Als nicht-kommerzieller Prototyp haftet HelloDev.social nicht für
        Schäden, die aus der Nutzung oder dem Vertrauen auf bereitgestellte
        Informationen entstehen.
      </p>

      <h3>5. Urheberrecht und Lizenzen</h3>
      <p>
        Sofern nicht anders angegeben, stehen Quellcode und Inhalte von
        HelloDev.social unter der <strong>MIT-Lizenz</strong>.  
        Drittanbieter-Inhalte (z. B. Open-Source-Bibliotheken) verbleiben unter
        ihren jeweiligen Lizenzen und sind entsprechend gekennzeichnet.
      </p>

      <h3>6. Anwendbares Recht</h3>
      <p>
        Dieses Projekt wird in Deutschland entwickelt.
        Etwaige Rechtsstreitigkeiten im Zusammenhang mit HelloDev.social
        unterliegen den geltenden Gesetzen der Bundesrepublik Deutschland und,
        soweit einschlägig, der Europäischen Union.
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

export default Legalnotice;