import { createBrowserRouter } from "react-router";
import AppEnhanced from "../AppEnhanced";

import NotFound from "../pages/NotFound";
import Profilepage from "../pages/Profile/ProfilePage";
import Chatpage from "../pages/ChatPage";
import Searchpage from "../pages/SearchPage";
import LegalNotice from "../pages/Legal/Legalnotice";
import GeneralTermsandConditions from "../pages/Legal/GeneralTermsandConditions";
import DataPrivacy from "../pages/Legal/DataPrivacy";
import About from "../pages/About";
import BuildProfile from "../pages/Profile/BuildProfile";
import MatchOverView from "../pages/MatchOverView";
import MatchPage from "../pages/MatchPage";
import LoginPageEnhanced from "../pages/Login/LoginPageEnhanced";
import RegisterPage from "../pages/Register/RegisterPage";
import LandingPage from "../pages/LandingPage/LandingPage";
import Home from "../pages/Home/Home";
import EditProfilePage from "../pages/Profile/EditProfilePage";
import ProtectedRouteEnhanced from "../components/ProtectedRouteEnhanced";
import Settings from "../pages/Settings";
import Messages from "../pages/Messages";
import Notifications from "../pages/Notifications";
import GetProfilePage from "../pages/Profile/GetProfilePage";
import AvatarEditor from "../pages/AvatarEditor/AvatarEditor";

export const routerEnhanced = createBrowserRouter([
  {
    path: "/",
    element: <AppEnhanced />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <LoginPageEnhanced /> },
      { path: "register", element: <RegisterPage /> },
      {
        path: "buildprofile",
        element: (
          <ProtectedRouteEnhanced>
            <BuildProfile />
          </ProtectedRouteEnhanced>
        ),
      },
      {
        path: "editprofile",
        element: (
          <ProtectedRouteEnhanced>
            <EditProfilePage />
          </ProtectedRouteEnhanced>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRouteEnhanced>
            <Profilepage />
          </ProtectedRouteEnhanced>
        ),
      },
      {
        path: "profile/:userId",
        element: (
          <ProtectedRouteEnhanced>
            <GetProfilePage />
          </ProtectedRouteEnhanced>
        ),
      },
      {
        path: "home",
        element: (
          <ProtectedRouteEnhanced>
            <Home />
          </ProtectedRouteEnhanced>
        ),
      },
      {
        path: "matchoverview",
        element: (
          <ProtectedRouteEnhanced>
            <MatchOverView />
          </ProtectedRouteEnhanced>
        ),
      },
      {
        path: "match",
        element: (
          <ProtectedRouteEnhanced>
            <MatchPage />
          </ProtectedRouteEnhanced>
        ),
      },
      {
        path: "chat",
        element: (
          <ProtectedRouteEnhanced>
            <Chatpage />
          </ProtectedRouteEnhanced>
        ),
      },
      {
        path: "chat/:userId",
        element: (
          <ProtectedRouteEnhanced>
            <Chatpage />
          </ProtectedRouteEnhanced>
        ),
      },
      {
        path: "search",
        element: (
          <ProtectedRouteEnhanced>
            <Searchpage />
          </ProtectedRouteEnhanced>
        ),
      },
      {
        path: "avatar-editor",
        element: (
          <ProtectedRouteEnhanced>
            <AvatarEditor />
          </ProtectedRouteEnhanced>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRouteEnhanced>
            <Settings />
          </ProtectedRouteEnhanced>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRouteEnhanced>
            <Notifications />
          </ProtectedRouteEnhanced>
        ),
      },
      {
        path: "messages",
        element: (
          <ProtectedRouteEnhanced>
            <Messages />
          </ProtectedRouteEnhanced>
        ),
      },
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