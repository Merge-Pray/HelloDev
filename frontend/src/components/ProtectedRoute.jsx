import { useState, useEffect } from "react";
import useUserStore from "../hooks/userstore";
import { Navigate } from "react-router";
import { authenticatedFetch } from "../utils/authenticatedFetch";

const ProtectedRoute = ({ children }) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!currentUser) {
          const response = await authenticatedFetch('/api/user/auth-status');
          if (response.success && response.user) {
            setCurrentUser(response.user);
          }
        }
      } catch (error) {
        clearUser();
      } finally {
        setIsChecking(false);
      }
    };

    if (!currentUser) {
      checkAuth();
    } else {
      setIsChecking(false);
    }
  }, [currentUser, setCurrentUser, clearUser]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
export default ProtectedRoute;
