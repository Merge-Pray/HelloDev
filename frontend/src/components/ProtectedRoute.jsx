import { useState, useEffect } from "react";
import useUserStore from "../hooks/userstore";
import { Navigate } from "react-router";

const ProtectedRoute = ({ children }) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    let timeout;

    if (!currentUser) {
      timeout = setTimeout(() => {
        setRedirect(true);
      }, 3000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [currentUser]);

  if (!currentUser && !redirect) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser && redirect) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
export default ProtectedRoute;
