import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/movie/:id" element={<MovieDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="*"
        element={
          <div className="text-center py-10">
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-500">
              404 - Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              The page you are looking for does not exist.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded text-white font-semibold transition"
            >
              Go Home
            </Link>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
