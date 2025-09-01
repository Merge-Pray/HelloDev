import { useState, useEffect, useRef } from "react";
import useUserStore from "../hooks/userstore";
import { Navigate } from "react-router";
import { validateSession } from "../utils/sessionManager";
import { isSamsungInternet, getSamsungBrowserInfo } from "../utils/samsungBrowserDebug";

const ProtectedRouteEnhanced = ({ children }) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const [authState, setAuthState] = useState({
    isLoading: true,
    isValidated: false,
    shouldRedirect: false,
    validationAttempts: 0
  });
  
  const validationRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Prevent multiple simultaneous validations
    if (validationRef.current) return;
    
    const performValidation = async () => {
      validationRef.current = true;
      
      try {
        // For Samsung browsers, log debug info
        if (isSamsungInternet()) {
          console.log('🔍 Samsung Browser - Starting auth validation');
          console.log('Browser info:', getSamsungBrowserInfo());
          console.log('Current user in store:', !!currentUser);
        }

        setAuthState(prev => ({ 
          ...prev, 
          isLoading: true,
          validationAttempts: prev.validationAttempts + 1
        }));

        const result = await validateSession();
        
        if (isSamsungInternet()) {
          console.log('🔍 Samsung Browser - Validation result:', result);
        }

        if (result.valid) {
          setAuthState({
            isLoading: false,
            isValidated: true,
            shouldRedirect: false,
            validationAttempts: 0
          });
        } else {
          // Set a longer timeout for mobile browsers before redirecting
          const redirectDelay = isSamsungInternet() ? 2000 : 1000;
          
          timeoutRef.current = setTimeout(() => {
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
              shouldRedirect: true
            }));
          }, redirectDelay);
        }
        
      } catch (error) {
        console.error('Auth validation failed:', error);
        
        // On error, give mobile browsers more time
        const errorDelay = isSamsungInternet() ? 3000 : 1500;
        
        timeoutRef.current = setTimeout(() => {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            shouldRedirect: true
          }));
        }, errorDelay);
      } finally {
        validationRef.current = false;
      }
    };

    performValidation();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []); // Only run once on mount

  // Handle user changes (login/logout)
  useEffect(() => {
    if (currentUser && !authState.isValidated) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isValidated: true,
        shouldRedirect: false
      }));
    } else if (!currentUser && authState.isValidated) {
      setAuthState(prev => ({
        ...prev,
        isValidated: false
      }));
    }
  }, [currentUser, authState.isValidated]);

  // Show loading state
  if (authState.isLoading) {
    const loadingMessage = isSamsungInternet() 
      ? "Initializing Samsung Browser compatibility..."
      : "Loading...";
      
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-2 text-gray-600">{loadingMessage}</p>
          {isSamsungInternet() && authState.validationAttempts > 1 && (
            <p className="mt-1 text-sm text-gray-500">
              Attempt {authState.validationAttempts}/3
            </p>
          )}
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (authState.shouldRedirect || (!currentUser && !authState.isValidated)) {
    if (isSamsungInternet()) {
      console.log('🔍 Samsung Browser - Redirecting to login');
    }
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return children;
};

export default ProtectedRouteEnhanced;