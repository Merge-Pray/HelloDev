export const getLayoutClasses = (styles, currentUser, pathname) => {
  const isRegisterPage = pathname === "/register";
  const isLoginPage = pathname === "/login";

  const appClasses = [
    styles.appLayout,
    !currentUser && styles.noUser,
    isRegisterPage && !currentUser && styles.allowScroll,
    isLoginPage && !currentUser && styles.allowScroll,
  ]
    .filter(Boolean)
    .join(" ");

  const mainClasses = [
    styles.fullWidth,
    (isRegisterPage || isLoginPage) && styles.allowScroll,
  ]
    .filter(Boolean)
    .join(" ");

  return { appClasses, mainClasses };
};
