import React from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import { searchMovies } from "../api";
import type { Movie, PaginatedResponse } from "../types";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<PaginatedResponse<Movie>, Error>({
    queryKey: ["searchMovies", query],
    queryFn: ({ pageParam }) => searchMovies(query, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage <= lastPage.total_pages ? nextPage : undefined;
    },
    enabled: !!query,
  });

  const movies = data?.pages.flatMap((page: any) => page.results) ?? [];

  if (!query && status !== "pending") {
    return (
      <p className="text-center text-gray-400 mt-10">
        Please enter a search term in the header.
      </p>
    );
  }

  return (
    <div>
      {query && (
        <h1 className="text-3xl font-bold mb-6 text-teal-400">
          Search Results for "{query}"
        </h1>
      )}

      {status === "pending" && <LoadingSpinner className="mt-20" />}

      {status === "error" && error && (
        <ErrorMessage message={error.message} className="mt-8" />
      )}

      {status === "success" && query && movies.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          No movies found matching "{query}".
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
                End of search results.
              </p>
            ) : null
          }
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
          style={{ minHeight: "50vh" }}
        >
          {movies.map((movie: any) => (
            <MovieCard key={`search-${movie.id}`} movie={movie} />
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default SearchPage;
