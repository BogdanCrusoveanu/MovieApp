import React from "react";
import { Link } from "react-router-dom";
import type { Movie } from "../types";
import { getImageUrl } from "../api";
import { Star } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const imageUrl = getImageUrl(movie.poster_path, "w342");
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  return (
    <Link
      to={`/movie/${movie.id}`}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out block group"
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={movie.title}
          className="w-full h-auto object-cover group-hover:opacity-80 transition-opacity duration-300 aspect-[2/3]"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = getImageUrl(null, "w342");
          }}
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
          <Star className="w-3 h-3 mr-1 text-yellow-400" fill="currentColor" />
          {rating}
        </div>
      </div>
      <div className="p-4">
        <h3
          className="font-semibold text-md text-white truncate group-hover:text-teal-400 transition duration-200"
          title={movie.title}
        >
          {movie.title}
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          {movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : "Unknown Year"}
        </p>
      </div>
    </Link>
  );
};

export default MovieCard;
