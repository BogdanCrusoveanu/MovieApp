import React from "react";
import { Star } from "lucide-react";
import type { MovieDetails } from "../types";
import { getImageUrl } from "../api";

const formatRuntime = (minutes: number | null | undefined): string => {
  if (minutes === null || minutes === undefined || minutes <= 0) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

interface MovieDetailsInfoProps {
  movie: MovieDetails;
}

const MovieDetailsInfo: React.FC<MovieDetailsInfoProps> = ({ movie }) => {
  const posterUrl = getImageUrl(movie.poster_path, "w500");

  return (
    <div
      className={`flex flex-col md:flex-row gap-8 relative ${
        movie.backdrop_path ? "-mt-32 md:-mt-48" : "mt-8"
      } z-10 px-4`}
    >
      <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
        <img
          src={posterUrl}
          alt={`Poster for ${movie.title}`}
          className="rounded-lg shadow-xl w-full max-w-xs mx-auto md:max-w-none border-4 border-gray-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = getImageUrl(null, "w500");
          }}
        />
      </div>

      <div
        className={`w-full md:w-2/3 lg:w-3/4 text-white ${
          movie.backdrop_path ? "pt-4 md:pt-16 lg:pt-24" : "pt-4"
        }`}
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
          {movie.title}
        </h1>
        {movie.tagline && (
          <p className="text-lg italic text-gray-300 mb-4">"{movie.tagline}"</p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-gray-300">
          <div
            className="flex items-center"
            title={`${movie.vote_average?.toFixed(1)} average rating out of ${
              movie.vote_count
            } votes`}
          >
            <Star
              className="w-5 h-5 mr-1 text-yellow-400"
              fill="currentColor"
            />
            <span>
              {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"} (
              {movie.vote_count ?? 0})
            </span>
          </div>
          <span>•</span>
          <span title="Runtime">{formatRuntime(movie.runtime)}</span>
          <span>•</span>
          <span title="Release Date">
            {movie.release_date
              ? new Date(movie.release_date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </span>
          <span>•</span>
          <span title="Status">{movie.status || "N/A"}</span>
        </div>
        <div className="mb-6">
          {movie.genres?.map((genre) => (
            <span
              key={genre.id}
              className="inline-block bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-200 mr-2 mb-2 hover:bg-gray-600 transition"
            >
              {genre.name}
            </span>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-teal-400">
            Overview
          </h2>
          <p className="text-gray-200 leading-relaxed prose prose-invert max-w-none">
            {movie.overview || "No overview available."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsInfo;
