import { create } from "zustand";
import { fetchMe, loginUser, registerUser } from "../api/auth";
import { getErrorMessage } from "../api/axios";
import { authStorage } from "./authStorage";

export const useAuthStore = create((set, get) => ({
  token: authStorage.getToken(),
  user: authStorage.getUser(),
  loading: false,
  error: "",
  setAuth(data) {
    authStorage.setAuth(data);
    set({ token: data.token, user: data.user, error: "" });
  },
  logout() {
    authStorage.clear();
    set({ token: "", user: null, error: "" });
  },
  async login(values) {
    set({ loading: true, error: "" });
    try {
      const { data } = await loginUser(values);
      get().setAuth(data.data);
      return data.data.user;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  async register(values) {
    set({ loading: true, error: "" });
    try {
      const { data } = await registerUser(values);
      get().setAuth(data.data);
      return data.data.user;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  async refreshMe() {
    if (!get().token) return null;

    try {
      const { data } = await fetchMe();
      authStorage.setAuth({ token: get().token, user: data.data.user });
      set({ user: data.data.user });
      return data.data.user;
    } catch {
      get().logout();
      return null;
    }
  },
}));
