import { useNavigate } from "react-router";
const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Landingpage</h1>
      <button onClick={() => navigate("/register")}>Register</button>
      <button onClick={() => navigate("/login")}>Login</button>
    </div>
  );
};
export default LandingPage;
