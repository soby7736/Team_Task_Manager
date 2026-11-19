
import { createSlice } from "@reduxjs/toolkit";
import { getUserRole } from "../config/roles";

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setCredentials: (state, action) => {
      const user = action.payload;

      state.user = user;

      // Assign our own application role
      state.role = getUserRole(user);

      state.isAuthenticated = true;
      state.isLoading = false;
    },

    clearCredentials: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
});

export const {
  setCredentials,
  clearCredentials,
} = authSlice.actions;

export default authSlice.reducer;
