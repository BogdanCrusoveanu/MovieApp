export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult?: boolean;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  homepage: string | null;
  imdb_id: string | null;
  runtime: number | null;
  status: string;
  tagline: string | null;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  id: number; // Movie ID
  cast: CastMember[];
  crew: CrewMember[];
}

export interface MovieImage {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface MovieImageResponse {
  id: number; // Movie ID
  backdrops: MovieImage[];
  logos: MovieImage[];
  posters: MovieImage[];
}

export interface BackendAuthResponse {
  userId: string;
  username: string;
  email: string;
  token: string;
  refreshToken?: string;
  expiration?: string | number;
}

export interface User {
  userId: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string | null;
  expiration?: string | number;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password?: string;
}

export interface LoginPayload {
  loginIdentifier: string;
  password?: string;
}

export interface RefreshTokenRequest {
  userId: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiration?: string | number;
}

export interface Comment {
  id: number;
  movieId: number;
  text: string;
  timestamp: string;
  userId: string;
  username: string;
}

export interface CreateCommentPayload {
  text: string;
}

export interface UpdateCommentPayload {
  text: string;
}
