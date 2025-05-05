import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { logout, tokenRefreshed } from "./features/auth/authSlice";
import type {
  Movie,
  MovieDetails,
  Genre,
  PaginatedResponse,
  Credits,
  MovieImageResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  Comment,
  CreateCommentPayload,
  UpdateCommentPayload,
  BackendAuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from "./types";
import store from "./store";

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE_URL = process.env.REACT_APP_TMDB_BASE_URL;
const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

const tmdbApiClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: "en-US",
  },
});

const baseApiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const backendApiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

backendApiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("authToken");
    if (accessToken && accessToken !== "undefined" && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

backendApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | RetryableAxiosRequestConfig
      | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/auth/refresh"
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = "Bearer " + token;
            }
            return backendApiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      console.log("Detected 401, attempting token refresh...");
      originalRequest._retry = true;
      isRefreshing = true;

      const currentUser = store.getState().auth.user;
      const userId = currentUser?.userId;

      if (!userId) {
        console.error("No userId found, cannot refresh token. Logging out.");
        isRefreshing = false;
        store.dispatch(logout());
        processQueue(new Error("No userId found for token refresh"), null);
        return Promise.reject(new Error("No userId found for token refresh"));
      }

      const refreshResult = await attemptTokenRefresh(userId);

      if (refreshResult) {
        console.log("Token refresh successful via interceptor.");
        store.dispatch(tokenRefreshed(refreshResult));
        if (originalRequest.headers) {
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${refreshResult.accessToken}`;
        }
        processQueue(null, refreshResult.accessToken);
        isRefreshing = false;
        return backendApiClient(originalRequest);
      } else {
        console.error("Token refresh failed via interceptor. Logging out.");
        processQueue(new Error("Token refresh failed"), null);
        isRefreshing = false;
        store.dispatch(logout());
        return Promise.reject(new Error("Token refresh failed"));
      }
    }

    return Promise.reject(error);
  }
);

export const attemptTokenRefresh = async (
  userId: string
): Promise<{ accessToken: string; refreshToken?: string } | null> => {
  try {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      console.error(
        "Manual token refresh: No refresh token found in localStorage."
      );
      return null;
    }

    const refreshPayload: RefreshTokenRequest = {
      userId,
    };
    console.log("Calling /api/auth/refresh with userId:", userId);

    const { data } = await baseApiClient.post<RefreshTokenResponse>(
      "/api/auth/refresh",
      refreshPayload
    );
    console.log("Manual token refresh successful.");
    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  } catch (refreshError: any) {
    console.error(
      "Manual token refresh API call failed:",
      refreshError.response?.data || refreshError.message
    );
    return null;
  }
};

export const fetchGenres = async (): Promise<Genre[]> => {
  try {
    const response = await tmdbApiClient.get<{ genres: Genre[] }>(
      "/genre/movie/list"
    );
    return response.data.genres;
  } catch (error) {
    console.error("Error fetching genres:", error);
    throw new Error("Failed to fetch genres");
  }
};

export const fetchPopularMovies = async (
  pageParam = 1
): Promise<PaginatedResponse<Movie>> => {
  try {
    const response = await tmdbApiClient.get<PaginatedResponse<Movie>>(
      "/movie/popular",
      {
        params: { page: pageParam },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    throw new Error("Failed to fetch popular movies");
  }
};

export const fetchTopRatedMovies = async (
  pageParam = 1
): Promise<PaginatedResponse<Movie>> => {
  try {
    const response = await tmdbApiClient.get<PaginatedResponse<Movie>>(
      "/movie/top_rated",
      {
        params: { page: pageParam },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching top rated movies:", error);
    throw new Error("Failed to fetch top rated movies");
  }
};

export const searchMovies = async (
  query: string,
  pageParam = 1
): Promise<PaginatedResponse<Movie>> => {
  const page = typeof pageParam === "number" ? pageParam : 1;
  try {
    const response = await tmdbApiClient.get<PaginatedResponse<Movie>>(
      "/search/movie",
      {
        params: { query, page: page, include_adult: false },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching movies:", error);
    throw new Error("Failed to search movies");
  }
};

export const discoverMoviesByGenre = async (
  genreId: number,
  pageParam = 1
): Promise<PaginatedResponse<Movie>> => {
  const page = typeof pageParam === "number" ? pageParam : 1;
  try {
    const response = await tmdbApiClient.get<PaginatedResponse<Movie>>(
      "/discover/movie",
      {
        params: {
          with_genres: genreId,
          page: page,
          sort_by: "popularity.desc",
          include_adult: false,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error discovering movies for genre ${genreId}:`, error);
    throw new Error("Failed to discover movies by genre");
  }
};

export const fetchMovieDetails = async (
  movieId: number
): Promise<MovieDetails> => {
  try {
    const response = await tmdbApiClient.get<MovieDetails>(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for movie ${movieId}:`, error);
    throw new Error("Failed to fetch movie details");
  }
};

export const fetchMovieCredits = async (movieId: number): Promise<Credits> => {
  try {
    const response = await tmdbApiClient.get<Credits>(
      `/movie/${movieId}/credits`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching credits for movie ${movieId}:`, error);
    throw new Error("Failed to fetch movie credits");
  }
};

export const fetchMovieImages = async (
  movieId: number
): Promise<MovieImageResponse> => {
  try {
    const response = await tmdbApiClient.get<MovieImageResponse>(
      `/movie/${movieId}/images`
    );
    return {
      ...response.data,
      backdrops: response.data.backdrops.slice(0, 10),
      posters: response.data.posters.slice(0, 10),
    };
  } catch (error) {
    console.error(`Error fetching images for movie ${movieId}:`, error);
    throw new Error("Failed to fetch movie images");
  }
};

export const getImageUrl = (
  path: string | null | undefined,
  size: string = "w500"
): string => {
  if (!path) {
    const width = size.replace("w", "") || "500";
    const height =
      size === "original"
        ? "1000"
        : (parseInt(width) * 1.5 || "750").toString();
    return `https://placehold.co/${width}x${height}/333/FFF?text=No+Image`;
  }
  return `${IMAGE_BASE_URL}${size}${path}`;
};

export const loginUser = async (
  payload: LoginPayload
): Promise<AuthResponse> => {
  try {
    const response = await backendApiClient.post<BackendAuthResponse>(
      "/api/auth/login",
      payload
    );
    const backendData = response.data;

    return {
      user: {
        userId: backendData.userId,
        username: backendData.username,
        email: backendData.email,
      },
      token: backendData.token,
      refreshToken: backendData.refreshToken,
      expiration: backendData.expiration,
    };
  } catch (error: any) {
    console.error("Login API error:", error.response?.data || error.message);
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(" ")
        : null) ||
      error.response?.data?.title ||
      error.response?.data ||
      error.message ||
      "Login failed";
    throw new Error(message);
  }
};

export const signupUser = async (payload: RegisterPayload): Promise<void> => {
  try {
    await backendApiClient.post("/api/auth/register", payload);
  } catch (error: any) {
    console.error("Signup API error:", error.response?.data || error.message);
    let errorMessage = "Sign up failed";
    if (error.response?.data?.errors) {
      errorMessage = Object.values(error.response.data.errors).flat().join(" ");
    } else {
      errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        (typeof error.response?.data === "string"
          ? error.response.data
          : null) ||
        error.message ||
        "Sign up failed";
    }
    throw new Error(errorMessage);
  }
};

export const fetchComments = async (movieId: number): Promise<Comment[]> => {
  try {
    const response = await backendApiClient.get<Comment[]>(
      `/api/movies/${movieId}/comments`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching comments for movie ${movieId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const postComment = async (
  movieId: number,
  payload: CreateCommentPayload
): Promise<Comment> => {
  try {
    const response = await backendApiClient.post<Comment>(
      `/api/movies/${movieId}/comments`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error posting comment for movie ${movieId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateComment = async (
  movieId: number,
  commentId: number,
  payload: UpdateCommentPayload
): Promise<void> => {
  try {
    await backendApiClient.put(
      `/api/movies/${movieId}/comments/${commentId}`,
      payload
    );
  } catch (error: any) {
    console.error(
      `Error updating comment ${commentId} for movie ${movieId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteComment = async (
  movieId: number,
  commentId: number
): Promise<void> => {
  try {
    await backendApiClient.delete(
      `/api/movies/${movieId}/comments/${commentId}`
    );
  } catch (error: any) {
    console.error(
      `Error deleting comment ${commentId} for movie ${movieId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
