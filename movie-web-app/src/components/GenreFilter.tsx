import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGenres } from "../api";
import type { Genre } from "../types";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

interface GenreFilterProps {
  selectedGenreId: number | null;
  onGenreChange: (genreId: number | null) => void;
}

const GenreFilter: React.FC<GenreFilterProps> = ({
  selectedGenreId,
  onGenreChange,
}) => {
  const {
    data: genres,
    isLoading,
    error,
    isError,
  } = useQuery<Genre[], Error>({
    queryKey: ["genres"],
    queryFn: fetchGenres,
    staleTime: Infinity,
  });

  if (isLoading)
    return (
      <div className="h-10 flex items-center justify-center">
        <LoadingSpinner size="sm" />
      </div>
    );
  if (isError)
    return (
      <ErrorMessage message={error?.message || "Could not load genres."} />
    );
  if (!genres || genres.length === 0)
    return <p className="text-sm text-gray-500">No genres available.</p>;

  return (
    <div>
      <label
        htmlFor="genre-select"
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        Filter by Genre:
      </label>
      <select
        id="genre-select"
        value={selectedGenreId ?? ""}
        onChange={(e) =>
          onGenreChange(e.target.value ? parseInt(e.target.value) : null)
        }
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md appearance-none"
        aria-label="Filter movies by genre"
      >
        <option value="">All Genres</option>
        {genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GenreFilter;
