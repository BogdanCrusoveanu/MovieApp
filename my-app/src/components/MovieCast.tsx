import React from "react";
import type { CastMember } from "../types";
import { getImageUrl } from "../api";

interface MovieCastProps {
  cast: CastMember[];
  totalCastCount: number;
}

const MovieCast: React.FC<MovieCastProps> = ({ cast, totalCastCount }) => {
  if (cast.length === 0) return null;

  const actorsToShow = cast.sort((a, b) => a.order - b.order).slice(0, 10);

  return (
    <div className="mt-12 px-4">
      <h2 className="text-2xl font-semibold mb-4 text-teal-400">
        Top Billed Cast
      </h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {actorsToShow.map((actor) => (
          <div
            key={actor.id}
            className="text-center bg-gray-800 p-3 rounded-lg shadow hover:shadow-lg transition flex-shrink-0 w-32"
          >
            <img
              src={getImageUrl(actor.profile_path, "w185")}
              alt={actor.name}
              className="w-24 h-24 rounded-full mx-auto mb-2 object-cover border-2 border-gray-700"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `https://placehold.co/185x185/374151/FFF?text=${
                  actor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "?"
                }`;
              }}
            />
            <p
              className="font-semibold text-sm text-white truncate"
              title={actor.name}
            >
              {actor.name}
            </p>
            <p
              className="text-xs text-gray-400 truncate"
              title={actor.character}
            >
              {actor.character}
            </p>
          </div>
        ))}
        {totalCastCount > actorsToShow.length && (
          <div className="flex items-center justify-center flex-shrink-0 w-32">
            <button
              onClick={(e) => e.preventDefault()}
              className="text-teal-400 hover:text-teal-300 text-sm font-semibold p-4 text-center"
              type="button"
            >
              See all...
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCast;
