import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthResponse } from "../../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken?: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const loadAuthState = (): AuthState => {
  const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
  try {
    const storedAccessToken = localStorage.getItem("authToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("authUser");

    if (storedAccessToken && storedUser) {
      initialState.user = JSON.parse(storedUser);
      initialState.accessToken = storedAccessToken;
      initialState.refreshToken = storedRefreshToken;
      initialState.isAuthenticated = true;
    }
  } catch (e) {
    console.error("Failed to load auth state from localStorage", e);
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authUser");
  }
  return initialState;
};

const initialAuthState: AuthState = loadAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
      localStorage.setItem("authToken", action.payload.token);
      if (action.payload.refreshToken) {
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      } else {
        localStorage.removeItem("refreshToken");
      }
      localStorage.setItem("authUser", JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("authUser");
    },
    signupStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signupSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    signupFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      console.log("Dispatching logout action");
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("authUser");
    },
    tokenRefreshed: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string }>
    ) => {
      console.log("Dispatching tokenRefreshed action");
      state.accessToken = action.payload.accessToken;
      localStorage.setItem("authToken", action.payload.accessToken);
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
  logout,
  tokenRefreshed,
} = authSlice.actions;

export default authSlice.reducer;
