import { useNavigate } from "react-router";
const DataPrivacy = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "48px 24px", maxWidth: 700, margin: "0 auto" }}>
  <h1>Privacy Policy</h1>
      <p>
        Your privacy is important to us. HelloDev does not collect personal data beyond what is necessary for account creation and basic usage. We do not share your information with third parties.
      </p>
      <p>
        All data is stored securely and only accessible to authorized team members. You can request deletion of your account and data at any time.
      </p>
      <p>
        For questions regarding privacy, please contact us via the provided channels in your profile.
      </p>
  <button style={{background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "999px", padding: "0.5rem 1.5rem", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", marginTop: "32px", transition: "background 0.2s"}} onClick={() => navigate(-1)}>← Back</button>
    </div>
  );
}
export default DataPrivacy