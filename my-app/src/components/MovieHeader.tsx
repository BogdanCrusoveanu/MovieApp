import React from "react";
import { getImageUrl } from "../api";

interface MovieHeaderProps {
  backdropPath: string | null | undefined;
  title: string;
}

const MovieHeader: React.FC<MovieHeaderProps> = ({ backdropPath, title }) => {
  if (!backdropPath) return null;

  const backdropUrl = getImageUrl(backdropPath, "original");

  return (
    <div
      className="relative h-64 md:h-96 bg-cover bg-center rounded-lg overflow-hidden mb-8 shadow-lg"
      style={{ backgroundImage: `url(${backdropUrl})` }}
      aria-label={`Backdrop for ${title}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
    </div>
  );
};

export default MovieHeader;
