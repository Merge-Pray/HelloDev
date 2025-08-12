import { createBrowserRouter } from "react-router";
import App from "../App";

import Landingpage from "../pages/Landingpage";
import NotFound from "../pages/NotFound";
import Loginpage from "../pages/LoginPage";
import Registerpage from "../pages/RegisterPage";
import Profilepage from "../pages/ProfilePage";
import Chatpage from "../pages/ChatPage";
import Searchpage from "../pages/SearchPage";
import LegalNotice from "../pages/Legal/Legalnotice";
import GeneralTermsandConditions from "../pages/Legal/GeneralTermsandConditions";
import DataPrivacy from "../pages/Legal/DataPrivacy";
import About from "../pages/About";
import Newsfeed from "../pages/Newsfeed";
import BuildProfile from "../pages/BuildProfile";
import MatchOverView from "../pages/MatchOverView";
import MatchPage from "../pages/MatchPage";
import EditProfilePage from "../pages/EditProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Landingpage /> },
      { path: "login", element: <Loginpage /> },
      { path: "register", element: <Registerpage /> },
      { path: "buildprofile", element: <BuildProfile /> },
      { path: "editprofile", element: <EditProfilePage /> },
      { path: "profile", element: <Profilepage /> },
      { path: "news", element: <Newsfeed /> },
      { path: "matchoverview", element: <MatchOverView /> },
      { path: "match", element: <MatchPage /> },
      { path: "chat", element: <Chatpage /> },
      { path: "search", element: <Searchpage /> },
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
