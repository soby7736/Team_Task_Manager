
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import AppRoutes from "./routes/AppRoutes";
import { getCurrentUser } from "./services/authService";
import {
  setCredentials,
  clearCredentials,
} from "./redux/authSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function restoreSession() {
      try {
        const user = await getCurrentUser();

        dispatch(setCredentials(user));
      } catch (error) {
        dispatch(clearCredentials());
      }
    }

    restoreSession();
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;
