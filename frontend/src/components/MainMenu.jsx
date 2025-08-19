import styles from "./MainMenu.module.css";
import { NavLink } from "react-router";
import DarkMode from "./DarkMode";

const topItems = [
  { to: "/home",          icon: "/icons/home.svg",          label: "Home" },
  { to: "/matches",       icon: "/icons/matches.svg",       label: "Matches" },
  { to: "/search",        icon: "/icons/search.svg",        label: "Search" },
  { to: "/messages",      icon: "/icons/messages.svg",      label: "Messages" },
  { to: "/notifications", icon: "/icons/notifications.svg", label: "Notifications" },
];

const bottomItems = [
  { to: "/profile",  icon: "/icons/profile.svg",  label: "Profile" },
  { to: "/settings", icon: "/icons/settings.svg", label: "Settings" },
];

export default function MainMenu() {
  return (
    <nav className={styles.menu} aria-label="Main">
      <div className={styles.brand}>
        <img
          src="/logo/HelloDev_Logo_White.svg"
          alt="Hello Dev Logo"
          className={styles.logo}
        />
      </div>

      <ul className={styles.listTop}>
        {topItems.map((item) => (
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

        {/* DarkMode-Button unter Settings */}
        <li className="darkmode">
          <DarkMode />
        </li>
      </ul>
    </nav>
  );
}