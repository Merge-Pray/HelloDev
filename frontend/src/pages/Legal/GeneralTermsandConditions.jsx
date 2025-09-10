import { useNavigate } from "react-router";
const GeneralTermsandConditions = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "48px 24px", maxWidth: 700, margin: "0 auto" }}>
  <h1>Terms & Conditions</h1>
      <p>
        By using HelloDev, you agree to abide by our community guidelines and respect other users. The platform is intended for educational and collaborative purposes only.
      </p>
      <p>
        We reserve the right to remove content or accounts that violate our terms. No warranty is provided for the availability or accuracy of the service.
      </p>
      <p>
        For full details, please contact the HelloDev team.
      </p>
  <button style={{background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "999px", padding: "0.5rem 1.5rem", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", marginTop: "32px", transition: "background 0.2s"}} onClick={() => navigate(-1)}>← Back</button>
    </div>
  );
}
export default GeneralTermsandConditions