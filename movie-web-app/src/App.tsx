import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "./redux/store";
import { logout } from "./redux/slices/authSlice";
import NavBar from "./components/NavBar";
import AppRoutes from "./AppRoutes";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans flex flex-col transition-colors duration-300">
      <NavBar
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AppRoutes />
      </main>

      <footer className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-center py-4 mt-12 flex-shrink-0 transition-colors duration-300">
        <p>
          &copy; {new Date().getFullYear()} MovieDB Viewer. Powered by{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 dark:text-teal-400 hover:underline"
          >
            TMDb
          </a>
          .
        </p>
      </footer>
    </div>
  );
}

export default App;
