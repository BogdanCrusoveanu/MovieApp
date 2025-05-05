import React, { useState } from "react";
import {
  useInfiniteQuery,
  QueryFunctionContext,
  InfiniteData,
} from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  fetchPopularMovies,
  fetchTopRatedMovies,
  discoverMoviesByGenre,
} from "../api";
import type { Movie, PaginatedResponse } from "../types";
import GenreFilter from "../components/GenreFilter";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import MovieCard from "../components/MovieCard";

type MovieListType = "popular" | "top_rated" | "genre";
type MovieQueryKey = readonly [
  "movies",
  MovieListType,
  (number | string | null)?
];

const HomePage: React.FC = () => {
  const [listType, setListType] = useState<MovieListType>("popular");
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);

  const queryKeyMap: Record<
    MovieListType,
    (genreId?: number | null) => MovieQueryKey
  > = {
    popular: (_genreId?: number | null) => ["movies", "popular", null],
    top_rated: (_genreId?: number | null) => ["movies", "top_rated", null],
    genre: (genreId) => ["movies", "genre", genreId ?? "none"],
  };

  const currentQueryKey = queryKeyMap[listType](selectedGenreId);

  const queryFn = async ({
    pageParam = 1,
  }: QueryFunctionContext<MovieQueryKey, number>) => {
    switch (listType) {
      case "popular":
        return fetchPopularMovies(pageParam);
      case "top_rated":
        return fetchTopRatedMovies(pageParam);
      case "genre":
        if (selectedGenreId === null) {
          throw new Error("Genre ID is required for genre search");
        }
        return discoverMoviesByGenre(selectedGenreId, pageParam);
      default:
        throw new Error(`Unknown list type: ${listType}`);
    }
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<
    PaginatedResponse<Movie>,
    Error,
    InfiniteData<PaginatedResponse<Movie>>,
    MovieQueryKey,
    number
  >({
    queryKey: currentQueryKey,
    queryFn: queryFn,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage <= lastPage.total_pages ? nextPage : undefined;
    },
    enabled:
      listType !== "genre" ||
      (listType === "genre" && selectedGenreId !== null),
  });

  const movies = data?.pages.flatMap((page: any) => page.results) ?? [];

  const handleGenreChange = (genreId: number | null) => {
    setSelectedGenreId(genreId);
    if (genreId !== null) {
      setListType("genre");
    } else {
      setListType("popular");
    }
    window.scrollTo(0, 0);
  };

  const handleListTypeChange = (type: MovieListType) => {
    if (type === listType && selectedGenreId === null) return;
    setListType(type);
    setSelectedGenreId(null);
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex space-x-4 order-1 md:order-1">
          <button
            onClick={() => handleListTypeChange("popular")}
            disabled={listType === "popular" && selectedGenreId === null}
            className={`px-4 py-2 rounded font-semibold transition ${
              listType === "popular" && selectedGenreId === null
                ? "bg-teal-500 text-white cursor-default"
                : "bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => handleListTypeChange("top_rated")}
            disabled={listType === "top_rated" && selectedGenreId === null}
            className={`px-4 py-2 rounded font-semibold transition ${
              listType === "top_rated" && selectedGenreId === null
                ? "bg-teal-500 text-white cursor-default"
                : "bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            Top Rated
          </button>
        </div>
        <div className="w-full md:w-auto md:max-w-xs order-2 md:order-2 mt-4 md:mt-0">
          <GenreFilter
            selectedGenreId={selectedGenreId}
            onGenreChange={handleGenreChange}
          />
        </div>
      </div>

      {status === "pending" && <LoadingSpinner className="mt-20" />}

      {status === "error" && error && (
        <ErrorMessage message={error.message} className="mt-8" />
      )}

      {status === "success" && movies.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          {listType === "genre" && selectedGenreId
            ? "No movies found for the selected genre."
            : "No movies found."}
        </p>
      )}
      {movies.length > 0 && (
        <InfiniteScroll
          dataLength={movies.length}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={<LoadingSpinner size="sm" className="my-8" />}
          endMessage={
            !isFetchingNextPage && movies.length > 0 ? (
              <p className="text-center text-gray-500 my-8">
                You've seen all the movies!
              </p>
            ) : null
          }
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
        >
          {movies.map((movie: any) => (
            <MovieCard
              key={`${listType}-${selectedGenreId ?? "all"}-${movie.id}`}
              movie={movie}
            />
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default HomePage;
