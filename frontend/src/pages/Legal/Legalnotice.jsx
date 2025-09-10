import { useNavigate } from "react-router";
const Legalnotice = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "48px 24px", maxWidth: 700, margin: "0 auto" }}>
  <h1>Legal Notice</h1>
      <p>
        This is the legal information page for HelloDev. All content is provided by the Merge & Pray team as part of the DCI Web Development course 2024/2025.
      </p>
      <p>
        For questions or legal concerns, please contact us via the channels provided in your profile.
      </p>
  <button style={{background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "999px", padding: "0.5rem 1.5rem", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", marginTop: "32px", transition: "background 0.2s"}} onClick={() => navigate(-1)}>← Back</button>
    </div>
  );
};
export default Legalnotice;
