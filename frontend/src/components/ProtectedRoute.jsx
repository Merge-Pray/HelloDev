import { useState, useEffect } from "react";
import useUserStore from "../hooks/userstore";
import { Navigate } from "react-router";

const ProtectedRoute = ({ children }) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const [redirect, setRedirect] = useState(false);

  console.log("🛡️ PROTECTED_ROUTE: Checking auth", {
    hasCurrentUser: !!currentUser,
    userId: currentUser?._id,
    redirect: redirect,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    if (!currentUser) {
      console.log("🛡️ PROTECTED_ROUTE: No currentUser, starting 1.5s timeout");
      const timeout = setTimeout(() => {
        console.log("🛡️ PROTECTED_ROUTE: Timeout reached, redirecting to login");
        setRedirect(true);
      }, 1500);
      return () => {
        console.log("🛡️ PROTECTED_ROUTE: Timeout cleared");
        clearTimeout(timeout);
      };
    } else {
      console.log("🛡️ PROTECTED_ROUTE: User authenticated, allowing access");
    }
  }, [currentUser]);

  if (!currentUser && !redirect) {
    console.log("🛡️ PROTECTED_ROUTE: Showing loading state");
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
    console.log("🛡️ PROTECTED_ROUTE: Redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("🛡️ PROTECTED_ROUTE: Rendering protected content");
  return children;
};

export default ProtectedRoute;
