import { createBrowserRouter } from "react-router";
import App from "../App";

import NotFound from "../pages/NotFound";
import Profilepage from "../pages/Profile/ProfilePage";
import Chatpage from "../pages/ChatPage";
import Searchpage from "../pages/SearchPage";
import LegalNotice from "../pages/Legal/Legalnotice";
import GeneralTermsandConditions from "../pages/Legal/GeneralTermsandConditions";
import DataPrivacy from "../pages/Legal/DataPrivacy";
import About from "../pages/About";
import Newsfeed from "../pages/Newsfeed";
import BuildProfile from "../pages/Profile/BuildProfile";
import MatchOverView from "../pages/MatchOverView";
import MatchPage from "../pages/MatchPage";
import LoginPage from "../pages/Login/LoginPage";
import RegisterPage from "../pages/Register/RegisterPage";
import LandingPage from "../pages/LandingPage/LandingPage";
import EditProfilePage from "../pages/Profile/EditProfilePage";
import ProtectedRoute from "../components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "buildprofile", element: <ProtectedRoute><BuildProfile /></ProtectedRoute> },
      { path: "editprofile", element: <ProtectedRoute><EditProfilePage /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><Profilepage /></ProtectedRoute> },
      { path: "news", element: <ProtectedRoute><Newsfeed /></ProtectedRoute> },
      { path: "matchoverview", element: <ProtectedRoute><MatchOverView /></ProtectedRoute> },
      { path: "match", element: <ProtectedRoute><MatchPage /></ProtectedRoute> },
      { path: "chat", element: <ProtectedRoute><Chatpage /></ProtectedRoute> },
      { path: "search", element: <ProtectedRoute><Searchpage /></ProtectedRoute> },
      { path: "legalnotice", element: <LegalNotice /> },
      { path: "gtc", element: <GeneralTermsandConditions /> },
      { path: "dataprivacy", element: <DataPrivacy /> },
      { path: "about", element: <About /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
