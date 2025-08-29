import styles from "./MainMenu.module.css";
import { NavLink, useNavigate, useLocation } from "react-router";
import DarkMode from "./DarkMode";
import { useUnreadCount } from "../hooks/useUnreadCount";

const topItems = [
  { to: "/home", icon: "/icons/home.svg", label: "Home" },
  { to: "/match", icon: "/icons/matches.svg", label: "Matches" },
  { to: "/search", icon: "/icons/search.svg", label: "Search" },
  {
    to: "/chat",
    icon: "/icons/messages.svg",
    label: "Chat",
    hasUnreadBadge: true,
  },
  {
    to: "/notifications",
    icon: "/icons/notifications.svg",
    label: "Notifications",
  },
];

const bottomItems = [
  { to: "/profile", icon: "/icons/profile.svg", label: "Profile" },
  { to: "/settings", icon: "/icons/settings.svg", label: "Settings" },
];

export default function MainMenu() {
  const { totalUnreadCount } = useUnreadCount();
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/home') {
      if (window.reloadNewsfeed) {
        window.reloadNewsfeed();
      }
    } else {
      navigate('/home');
    }
  };

  return (
    <nav className={styles.menu} aria-label="Main">
      <div className={styles.brand}>
        <button onClick={handleHomeClick} className={styles.logoLink}>
          <img
            src="/logo/HelloDev_Logo_White.svg"
            alt="Hello Dev Logo"
            className={`${styles.logo} ${styles.logoDark}`}
          />
          <img
            src="/logo/HelloDev_Logo_Color.svg"
            alt="Hello Dev Logo"
            className={`${styles.logo} ${styles.logoLight}`}
          />
        </button>
      </div>

      <ul className={styles.listTop}>
        {topItems.map((item) => (
          <li key={item.to}>
            {item.to === "/home" ? (
              <button
                onClick={handleHomeClick}
                className={[styles.link, location.pathname === "/home" ? styles.active : ""].join(" ")}
              >
                <div className={styles.iconContainer}>
                  <img src={item.icon} alt="" className={styles.icon} />
                  {item.hasUnreadBadge && totalUnreadCount > 0 && (
                    <span className={styles.unreadBadge}>
                      {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                    </span>
                  )}
                </div>
                <span className={styles.label}>{item.label}</span>
              </button>
            ) : (
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [styles.link, isActive ? styles.active : ""].join(" ")
                }
              >
                <div className={styles.iconContainer}>
                  <img src={item.icon} alt="" className={styles.icon} />
                  {item.hasUnreadBadge && totalUnreadCount > 0 && (
                    <span className={styles.unreadBadge}>
                      {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                    </span>
                  )}
                </div>
                <span className={styles.label}>{item.label}</span>
              </NavLink>
            )}
          </li>
        ))}
      </ul>

      <li className={styles.darkmode}>
        <DarkMode />
      </li>

      <ul className={styles.listBottom}>
        {bottomItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                [styles.link, isActive ? styles.active : ""].join(" ")
              }
            >
              <img src={item.icon} alt="" className={styles.icon} />
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
