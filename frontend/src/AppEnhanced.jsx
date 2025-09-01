import "./App.css";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import MainMenu from "./components/MainMenu";
import useUserStore from "./hooks/userstore";
import { authenticatedFetch } from "./utils/authenticatedFetch";
import { validateSession } from "./utils/sessionManager";
import { isSamsungInternet, debugLoginIssue } from "./utils/samsungBrowserDebug";
import styles from "./app.layout.module.css";

function AppEnhanced() {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const setSocket = useUserStore((state) => state.setSocket);
  const clearUser = useUserStore((state) => state.clearUser);
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);

  const isRegisterPage = location.pathname === "/register";
  const isLoginPage = location.pathname === "/login";
  const isLandingPage = location.pathname === "/";

  // Initialize app and validate session on startup
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeApp = async () => {
      try {
        if (isSamsungInternet()) {
          console.log('🔍 Samsung Browser - Initializing app');
          debugLoginIssue(currentUser);
        }

        // Validate existing session
        const sessionResult = await validateSession();
        
        if (isSamsungInternet()) {
          console.log('🔍 Samsung Browser - Session validation result:', sessionResult);
        }

        if (sessionResult.valid) {
          // User is authenticated, redirect from public pages to home
          if (isLandingPage || isLoginPage || isRegisterPage) {
            navigate('/home', { replace: true });
          }
        } else {
          // User is not authenticated, redirect from protected pages to landing
          const protectedPaths = ['/home', '/profile', '/chat', '/search', '/match', '/settings'];
          const isProtectedPath = protectedPaths.some(path => location.pathname.startsWith(path));
          
          if (isProtectedPath) {
            navigate('/', { replace: true });
          }
        }
      } catch (error) {
        console.error('App initialization failed:', error);
        
        // On error, clear any stale data and redirect to landing
        clearUser();
        if (location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/', { replace: true });
        }
      } finally {
        setIsInitialized(true);
      }
    };

    // Add a small delay for Samsung browsers to ensure localStorage is ready
    const initDelay = isSamsungInternet() ? 200 : 0;
    setTimeout(initializeApp, initDelay);
  }, []); // Only run once on app startup

  // Socket connection management
  useEffect(() => {
    if (currentUser && !socketRef.current && isInitialized) {
      const connectSocket = async () => {
        try {
          const socketUrl = import.meta.env.VITE_BACKENDPATH;

          const socket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'], // Fallback for mobile browsers
            timeout: 10000,
            forceNew: true
          });

          socket.on("connect", () => {
            console.log("Socket connected to server:", socket.id);
            if (isSamsungInternet()) {
              console.log('🔍 Samsung Browser - Socket connected successfully');
            }
          });

          socket.on("connect_error", async (error) => {
            console.error("Socket connection error:", error);

            if (error.message === "Authentication failed") {
              try {
                await authenticatedFetch("/api/user/refresh");
                setTimeout(() => socket.connect(), 1000);
              } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                clearUser();
                navigate('/login', { replace: true });
              }
            }
          });

          socket.on("disconnect", (reason) => {
            console.log("Disconnected from server, reason:", reason);
          });

          socketRef.current = socket;
          setSocket(socket);
        } catch (err) {
          console.error("Socket connection error:", err);
        }
      };

      connectSocket();
    }

    // Cleanup socket when user logs out
    if (!currentUser && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  }, [currentUser, setSocket, clearUser, navigate, isInitialized]);

  // Handle browser-specific user changes
  useEffect(() => {
    if (currentUser && isSamsungInternet()) {
      // For Samsung browsers, periodically verify localStorage consistency
      const verifyInterval = setInterval(() => {
        try {
          const stored = localStorage.getItem('user-storage');
          if (!stored) {
            console.warn('Samsung Browser - localStorage lost, restoring...');
            const userStorage = {
              state: { currentUser },
              version: 0
            };
            localStorage.setItem('user-storage', JSON.stringify(userStorage));
          }
        } catch (error) {
          console.error('Samsung Browser - localStorage verification failed:', error);
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(verifyInterval);
    }
  }, [currentUser]);

  // Show loading screen during initialization
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-2 text-gray-600">
            {isSamsungInternet() ? "Initializing Samsung Browser compatibility..." : "Initializing HelloDev..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.appLayout} ${!currentUser ? styles.noUser : ""} ${
        isRegisterPage && !currentUser ? styles.allowScroll : ""
      } ${isLoginPage && !currentUser ? styles.allowScroll : ""}`}
    >
      {currentUser ? (
        <>
          <aside className={styles.navigation}>
            <MainMenu />
          </aside>
          <main className={styles.content}>
            <Outlet />
          </main>
        </>
      ) : (
        <main
          className={`${styles.fullWidth} ${
            isRegisterPage || isLoginPage ? styles.allowScroll : ""
          }`}
        >
          <Outlet />
        </main>
      )}
    </div>
  );
}

export default AppEnhanced;