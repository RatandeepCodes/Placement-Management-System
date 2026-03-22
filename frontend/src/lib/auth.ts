export const getToken = () => localStorage.getItem("token") || "";

export const getRole = (): "student" | "admin" | null => {
  const role = localStorage.getItem("role");
  if (role === "student" || role === "admin") return role;
  return null;
};

export const isAuthenticated = () => Boolean(getToken());

export const clearProfileCache = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("profile_") || key === "student_avatar") {
      localStorage.removeItem(key);
    }
  });
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user_id");
  // Keep profile cache so re-login to same user still shows saved profile.
  // clearProfileCache() is intentionally not called here.
};