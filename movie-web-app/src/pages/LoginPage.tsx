import React, { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../api";
import type { AppDispatch, RootState } from "../redux/store";
import type { LoginPayload } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import {
  loginFailure,
  loginStart,
  loginSuccess,
} from "../redux/slices/authSlice";

const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const payload: LoginPayload = {
        loginIdentifier: identifier,
        password: password,
      };
      const authResponse = await loginUser(payload);
      dispatch(loginSuccess(authResponse));
      navigate("/");
    } catch (err: any) {
      const errorMessage =
        typeof err?.message === "string" ? err.message : "Login failed";
      dispatch(loginFailure(errorMessage));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-gray-800 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-center text-teal-400 mb-6">
        Login
      </h1>
      {error && <ErrorMessage message={error} className="mb-4" />}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="identifier"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Username or Email
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="yourname or you@example.com"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="••••••••"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              "Sign in"
            )}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-medium text-teal-400 hover:text-teal-300"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
