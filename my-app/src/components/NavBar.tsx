import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Sun, Moon } from "lucide-react";

interface NavBarProps {
  isAuthenticated: boolean;
  user: { username: string } | null;
  onLogout: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ isAuthenticated, user, onLogout }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleSearch = (term: string) => {
    const trimmedTerm = term.trim();
    if (trimmedTerm) {
      navigate(`/search?query=${encodeURIComponent(trimmedTerm)}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch(searchTerm);
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <header className="bg-gray-200 dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <nav className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link
          to="/"
          className="text-2xl font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition duration-200 flex-shrink-0"
        >
          MovieDB Viewer
        </Link>

        <div className="relative w-full max-w-xs sm:w-auto order-last sm:order-none">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search movies..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-300"
            aria-label="Search movies input"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-5 w-5 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300"
            onClick={() => handleSearch(searchTerm)}
            aria-label="Submit search button"
          />
        </div>

        <div className="flex items-center space-x-4 order-first sm:order-last">
          {isAuthenticated ? (
            <>
              <span className="text-gray-700 dark:text-gray-300 text-sm hidden sm:inline transition-colors duration-300">
                Welcome, {user?.username}!
              </span>
              <button
                onClick={onLogout}
                className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition text-sm font-medium duration-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1 rounded bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition"
              >
                Sign Up
              </Link>
            </>
          )}

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-300"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
