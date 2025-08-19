import styles from "./MainMenu.module.css";
import { NavLink } from "react-router";

const items = [
  { to: "/",           icon: "🏠", label: "Home" },
  { to: "/matches",    icon: "✨", label: "Matches" },
  { to: "/search",     icon: "🔎", label: "Search" },
  { to: "/messages",   icon: "💬", label: "Messages" },
  { to: "/notifications", icon: "💖", label: "Notifications" },
  { to: "/profile",    icon: "👤", label: "Profile" },
  { to: "/settings",   icon: "⚙️", label: "Settings" },
];

export default function MainMenu() {
  return (
    <nav className={styles.menu} aria-label="Main">
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden>🖐️</span>
        <span className={styles.brandText}>Hello<br/>Dev</span>
      </div>

      <ul className={styles.list}>
        {items.map(item => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                [styles.link, isActive ? styles.active : ""].join(" ")
              }
            >
              <span className={styles.icon} aria-hidden>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}