import { useState, useEffect } from "react";
import useUserStore from "../hooks/userstore";
import { Navigate } from "react-router";

const ProtectedRoute = ({ children }) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setTimeout(() => {
        setRedirect(true);
      }, 3000);
    }
  }, [currentUser]);

  if (!currentUser && !redirect) {
    return (
      <>
        <p>You have to login.</p>{" "}
        <p>You will be redirected to the login page shortly...</p>
      </>
    );
  }

  if (!currentUser && redirect) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
export default ProtectedRoute;
