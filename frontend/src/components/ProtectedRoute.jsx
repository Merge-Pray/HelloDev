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

  // Samsung debugging for ProtectedRoute
  try {
    let protectedLog = sessionStorage.getItem('samsung_protected_log') || '';
    protectedLog += `\n${new Date().toISOString()}: ProtectedRoute render - hasUser: ${!!currentUser}, redirect: ${redirect}`;
    sessionStorage.setItem('samsung_protected_log', protectedLog);
  } catch (e) {
    console.error("Failed to log to sessionStorage:", e);
  }

  useEffect(() => {
    try {
      let protectedLog = sessionStorage.getItem('samsung_protected_log') || '';
      
      if (!currentUser) {
        console.log("🛡️ PROTECTED_ROUTE: No currentUser, starting 1.5s timeout");
        protectedLog += `\n${new Date().toISOString()}: No currentUser, starting timeout`;
        sessionStorage.setItem('samsung_protected_log', protectedLog);
        
        const timeout = setTimeout(() => {
          console.log("🛡️ PROTECTED_ROUTE: Timeout reached, redirecting to login");
          protectedLog += `\n${new Date().toISOString()}: Timeout reached, redirecting`;
          sessionStorage.setItem('samsung_protected_log', protectedLog);
          setRedirect(true);
        }, 1500);
        
        return () => {
          console.log("🛡️ PROTECTED_ROUTE: Timeout cleared");
          protectedLog += `\n${new Date().toISOString()}: Timeout cleared`;
          sessionStorage.setItem('samsung_protected_log', protectedLog);
          clearTimeout(timeout);
        };
      } else {
        console.log("🛡️ PROTECTED_ROUTE: User authenticated, allowing access");
        protectedLog += `\n${new Date().toISOString()}: User authenticated, allowing access`;
        sessionStorage.setItem('samsung_protected_log', protectedLog);
      }
    } catch (error) {
      console.error("🛡️ PROTECTED_ROUTE ERROR:", error);
      alert("ProtectedRoute error: " + error.message);
    }
  }, [currentUser]);

  if (!currentUser && !redirect) {
    console.log("🛡️ PROTECTED_ROUTE: Showing loading state");
    try {
      let protectedLog = sessionStorage.getItem('samsung_protected_log') || '';
      protectedLog += `\n${new Date().toISOString()}: Showing loading state`;
      sessionStorage.setItem('samsung_protected_log', protectedLog);
    } catch (e) {}
    
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
    try {
      let protectedLog = sessionStorage.getItem('samsung_protected_log') || '';
      protectedLog += `\n${new Date().toISOString()}: Redirecting to login`;
      sessionStorage.setItem('samsung_protected_log', protectedLog);
    } catch (e) {}
    
    return <Navigate to="/login" replace />;
  }

  console.log("🛡️ PROTECTED_ROUTE: Rendering protected content");
  try {
    let protectedLog = sessionStorage.getItem('samsung_protected_log') || '';
    protectedLog += `\n${new Date().toISOString()}: Rendering protected content`;
    sessionStorage.setItem('samsung_protected_log', protectedLog);
  } catch (e) {}
  
  return children;
};

export default ProtectedRoute;
