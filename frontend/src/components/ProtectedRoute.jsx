import { useState, useEffect } from "react";
import useUserStore from "../hooks/userstore";
import { Navigate } from "react-router";
import { authenticatedFetch } from "../utils/authenticatedFetch";

const ProtectedRoute = ({ children }) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const [redirect, setRedirect] = useState(false);

  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateUser = async () => {
      if (!currentUser) {
        setIsValidating(false);
        const timeout = setTimeout(() => setRedirect(true), 1500);
        return () => clearTimeout(timeout);
      }

      // Small delay to ensure cookie is set after login
      await new Promise(resolve => setTimeout(resolve, 100));

      // Validate token with server
      try {
        await authenticatedFetch('/api/user/user');
        setIsValidating(false);
      } catch {
        // Token invalid - clear user and redirect
        clearUser();
        setRedirect(true);
        setIsValidating(false);
      }
    };

    validateUser();
  }, [currentUser, clearUser]);


  if ((!currentUser || isValidating) && !redirect) {
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
