import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMovieDetails, fetchMovieCredits, fetchMovieImages } from "../api";
import type { MovieDetails, Credits, MovieImageResponse } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import MovieHeader from "../components/MovieHeader";
import MovieDetailsInfo from "../components/MovieDetailsInfo";
import MovieCast from "../components/MovieCast";
import MovieGallery from "../components/MovieGallery";
import MovieComments from "../components/MovieComments";

const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();

  const {
    data: movie,
    status: detailsStatus,
    error: errorDetails,
  } = useQuery<MovieDetails, Error>({
    queryKey: ["movieDetails", movieId],
    queryFn: () => fetchMovieDetails(movieId),
    enabled: !!movieId,
  });

  const { data: credits, status: creditsStatus } = useQuery<Credits, Error>({
    queryKey: ["movieCredits", movieId],
    queryFn: () => fetchMovieCredits(movieId),
    enabled: !!movieId,
  });

  const { data: images, status: imagesStatus } = useQuery<
    MovieImageResponse,
    Error
  >({
    queryKey: ["movieImages", movieId],
    queryFn: () => fetchMovieImages(movieId),
    enabled: !!movieId,
  });

  const isLoading =
    detailsStatus === "pending" ||
    creditsStatus === "pending" ||
    imagesStatus === "pending";
  const isError =
    detailsStatus === "error" ||
    creditsStatus === "error" ||
    imagesStatus === "error";
  const combinedError = errorDetails;

  if (!movieId)
    return <ErrorMessage message="Invalid Movie ID." className="mt-8" />;
  if (isLoading) return <LoadingSpinner className="mt-20" />;
  if (isError)
    return (
      <ErrorMessage
        message={combinedError?.message || "Failed to load movie details."}
        className="mt-8"
      />
    );
  if (!movie)
    return (
      <p className="text-center text-gray-400 mt-10">
        Movie not found or failed to load.
      </p>
    );

  return (
    <div className="movie-details">
      <MovieHeader backdropPath={movie.backdrop_path} title={movie.title} />

      <MovieDetailsInfo movie={movie} />

      <MovieCast
        cast={credits?.cast ?? []}
        totalCastCount={credits?.cast.length ?? 0}
      />

      <MovieGallery images={images?.backdrops ?? []} movieTitle={movie.title} />

      <MovieComments movieId={movieId} />
    </div>
  );
};

export default MovieDetailsPage;
