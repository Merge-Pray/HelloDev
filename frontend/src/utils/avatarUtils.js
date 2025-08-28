/**
 * Avatar Utilities für konsistente Avatar-Darstellung
 */

/**
 * Standard Fallback Avatar-Pfad
 */
const DEFAULT_AVATAR = "/avatars/default_avatar.png";

/**
 * Avatar-URL mit Fallback auf default-avatar.png
 * @param {string|null} avatarUrl - Die Avatar URL
 * @returns {string} Avatar URL oder default-avatar.png
 */
export const getAvatarSrc = (avatarUrl) => {
  return avatarUrl || DEFAULT_AVATAR;
};

/**
 * Error-Handler für Avatar-Bilder
 * @param {Event} event - Das Error-Event
 */
export const handleAvatarError = (event) => {
  event.target.src = DEFAULT_AVATAR;
};

/**
 * Avatar-Props für img-Tag generieren
 * @param {string|null} avatarUrl - Die Avatar URL
 * @param {string} alt - Alt-Text
 * @returns {object} Props für img-Tag
 */
export const getAvatarProps = (avatarUrl, alt) => ({
  src: getAvatarSrc(avatarUrl),
  alt,
  onError: handleAvatarError,
  loading: "lazy",
  decoding: "async"
});
