const tokenKey = "taSki_token";
const userKey = "taSki_user";

export const authStorage = {
  getToken() {
    return sessionStorage.getItem(tokenKey) || "";
  },
  getUser() {
    const savedUser = sessionStorage.getItem(userKey);
    return savedUser ? JSON.parse(savedUser) : null;
  },
  setAuth({ token, user }) {
    sessionStorage.setItem(tokenKey, token);
    sessionStorage.setItem(userKey, JSON.stringify(user));
  },
  clear() {
    sessionStorage.removeItem(tokenKey);
    sessionStorage.removeItem(userKey);
  },
};
