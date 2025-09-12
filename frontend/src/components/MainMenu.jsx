import styles from "./MainMenu.module.css";
import { NavLink, useNavigate, useLocation } from "react-router";
import DarkMode from "./DarkMode";
import { useUnreadCount } from "../hooks/useUnreadCount";
import { useNotificationCount } from "../hooks/useNotificationCount";
import { useState } from "react";
import { Users } from "lucide-react";

const topItems = [
  { to: "/home", icon: "/icons/home.svg", label: "Home" },
  { to: "/match", icon: "/icons/matches.svg", label: "Matches" },
  { to: "/search", icon: "/icons/search.svg", label: "Search" },
  {
    to: "/chat",
    icon: "/icons/messages.svg",
    label: "Chat",
    hasUnreadBadge: true,
    badgeType: "chat",
  },
  {
    to: "/notifications",
    icon: "/icons/notifications.svg",
    label: "Notifications",
    hasUnreadBadge: true,
    badgeType: "notifications",
  },
];

const bottomItems = [
  { to: "/profile", icon: "/icons/profile.svg", label: "Profile" },
  { to: "/settings", icon: "/icons/settings.svg", label: "Settings" },
];

export default function MainMenu() {
  const { totalUnreadCount } = useUnreadCount();
  const { notificationCount } = useNotificationCount();
  const navigate = useNavigate();
  const location = useLocation();
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);

  const getBadgeCount = (item) => {
    if (!item.hasUnreadBadge) return 0;
    if (item.badgeType === "chat") return totalUnreadCount;
    if (item.badgeType === "notifications") return notificationCount;
    return 0;
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (location.pathname === "/home") {
      if (window.reloadNewsfeed) {
        window.reloadNewsfeed();
      }
    } else {
      navigate("/home");
    }
  };

  const toggleBurger = () => {
    setIsBurgerOpen(!isBurgerOpen);
  };

  const closeBurger = () => {
    setIsBurgerOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className={styles.mobileTopBar}>
        <button
          className={styles.burgerButton}
          onClick={toggleBurger}
          aria-label="Menu"
        >
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
        </button>

        <button onClick={handleHomeClick} className={styles.logoLink}>
          <img
            src="/logo/HelloDev_Logo_White.svg"
            alt="Hello Dev Logo"
            className={`${styles.mobileTopLogo} ${styles.logoDark}`}
          />
          <img
            src="/logo/HelloDev_Logo_Color.svg"
            alt="Hello Dev Logo"
            className={`${styles.mobileTopLogo} ${styles.logoLight}`}
          />
        </button>

        <div className={styles.mobileTopRight}>
          <DarkMode />
        </div>
      </div>

      {/* Mobile Burger Menu Overlay */}
      {isBurgerOpen && (
        <>
          <div className={styles.overlay} onClick={closeBurger}></div>
          <div className={styles.burgerMenu}>
            <div className={styles.burgerHeader}>
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
              <button
                className={styles.closeButton}
                onClick={closeBurger}
                aria-label="Close Menu"
              >
                ✕
              </button>
            </div>

            <ul className={styles.burgerListTop}>
              {topItems.map((item) => (
                <li key={item.to}>
                  {item.to === "/home" ? (
                    <button
                      onClick={(e) => {
                        handleHomeClick(e);
                        closeBurger();
                      }}
                      className={[
                        styles.burgerLink,
                        location.pathname === "/home" ? styles.active : "",
                      ].join(" ")}
                    >
                      <div className={styles.iconContainer}>
                        <img src={item.icon} alt="" className={styles.icon} />
                        {item.hasUnreadBadge && getBadgeCount(item) > 0 && (
                          <span className={styles.unreadBadge}>
                            {getBadgeCount(item) > 99
                              ? "99+"
                              : getBadgeCount(item)}
                          </span>
                        )}
                      </div>
                      <span className={styles.label}>{item.label}</span>
                    </button>
                  ) : (
                    <NavLink
                      to={item.to}
                      onClick={closeBurger}
                      className={({ isActive }) =>
                        [styles.burgerLink, isActive ? styles.active : ""].join(
                          " "
                        )
                      }
                    >
                      <div className={styles.iconContainer}>
                        <img src={item.icon} alt="" className={styles.icon} />
                        {item.hasUnreadBadge && getBadgeCount(item) > 0 && (
                          <span className={styles.unreadBadge}>
                            {getBadgeCount(item) > 99
                              ? "99+"
                              : getBadgeCount(item)}
                          </span>
                        )}
                      </div>
                      <span className={styles.label}>{item.label}</span>
                    </NavLink>
                  )}
                </li>
              ))}

              <li>
                <NavLink
                  to="/contacts"
                  onClick={closeBurger}
                  className={({ isActive }) =>
                    [styles.burgerLink, isActive ? styles.active : ""].join(" ")
                  }
                >
                  <div className={styles.iconContainer}>
                    <Users size={28} className={styles.lucideIcon} />
                  </div>
                  <span className={styles.label}>Contacts</span>
                </NavLink>
              </li>
            </ul>

            <div className={styles.burgerDivider}></div>

            <ul className={styles.burgerListBottom}>
              {bottomItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={closeBurger}
                    className={({ isActive }) =>
                      [styles.burgerLink, isActive ? styles.active : ""].join(
                        " "
                      )
                    }
                  >
                    <img src={item.icon} alt="" className={styles.icon} />
                    <span className={styles.label}>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Desktop/Tablet Navigation */}
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
                  className={[
                    styles.link,
                    location.pathname === "/home" ? styles.active : "",
                  ].join(" ")}
                >
                  <div className={styles.iconContainer}>
                    <img src={item.icon} alt="" className={styles.icon} />
                    {item.hasUnreadBadge && getBadgeCount(item) > 0 && (
                      <span className={styles.unreadBadge}>
                        {getBadgeCount(item) > 99 ? "99+" : getBadgeCount(item)}
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
                    {item.hasUnreadBadge && getBadgeCount(item) > 0 && (
                      <span className={styles.unreadBadge}>
                        {getBadgeCount(item) > 99 ? "99+" : getBadgeCount(item)}
                      </span>
                    )}
                  </div>
                  <span className={styles.label}>{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}

          <li className={styles.contactsItem}>
            <NavLink
              to="/contacts"
              className={({ isActive }) =>
                [styles.link, isActive ? styles.active : ""].join(" ")
              }
            >
              <div className={styles.iconContainer}>
                <Users size={25} className={styles.lucideIcon} />
              </div>
              <span className={styles.label}>Contacts</span>
            </NavLink>
          </li>
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
        </ul>
      </nav>

      <nav className={styles.bottomNav} aria-label="Main">
        <ul className={styles.bottomNavList}>
          {topItems.map((item) => (
            <li key={item.to}>
              {item.to === "/home" ? (
                <button
                  onClick={handleHomeClick}
                  className={[
                    styles.bottomNavLink,
                    location.pathname === "/home" ? styles.active : "",
                  ].join(" ")}
                >
                  <div className={styles.iconContainer}>
                    <img src={item.icon} alt="" className={styles.icon} />
                    {item.hasUnreadBadge && getBadgeCount(item) > 0 && (
                      <span className={styles.unreadBadge}>
                        {getBadgeCount(item) > 99 ? "99+" : getBadgeCount(item)}
                      </span>
                    )}
                  </div>
                  <span className={styles.label}>{item.label}</span>
                </button>
              ) : (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    [styles.bottomNavLink, isActive ? styles.active : ""].join(
                      " "
                    )
                  }
                >
                  <div className={styles.iconContainer}>
                    <img src={item.icon} alt="" className={styles.icon} />
                    {item.hasUnreadBadge && getBadgeCount(item) > 0 && (
                      <span className={styles.unreadBadge}>
                        {getBadgeCount(item) > 99 ? "99+" : getBadgeCount(item)}
                      </span>
                    )}
                  </div>
                  <span className={styles.label}>{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}

          <li>
            <NavLink
              to="/contacts"
              className={({ isActive }) =>
                [styles.bottomNavLink, isActive ? styles.active : ""].join(" ")
              }
            >
              <div className={styles.iconContainer}>
                <Users size={22} className={styles.lucideIcon} />
              </div>
              <span className={styles.label}>Contacts</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
}
