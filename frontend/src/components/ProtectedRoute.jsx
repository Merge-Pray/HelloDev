import { useState, useEffect } from "react";
import useUserStore from "../hooks/userstore";
import { Navigate } from "react-router";

const ProtectedRoute = ({ children }) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    let timeout;

    if (!currentUser) {
      // Give a brief moment for the user to load from localStorage
      timeout = setTimeout(() => {
        setRedirect(true);
      }, 1000); // Shorter timeout than Pollio since we have better state management
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [currentUser]);

  // Show loading state briefly to allow localStorage to load
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

  // Redirect to login if no user after timeout
  if (!currentUser && redirect) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
export default ProtectedRoute;
