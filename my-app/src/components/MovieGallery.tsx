import React from "react";
import type { MovieImage } from "../types";
import { getImageUrl } from "../api";

interface MovieGalleryProps {
  images: MovieImage[];
  movieTitle: string;
}

const MovieGallery: React.FC<MovieGalleryProps> = ({ images, movieTitle }) => {
  if (images.length === 0) return null;

  const galleryImages = images.slice(0, 8);

  return (
    <div className="mt-12 px-4">
      <h2 className="text-2xl font-semibold mb-4 text-teal-400">Gallery</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {galleryImages.map((image, index) => (
          <div
            key={index}
            className="aspect-video rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer group relative"
          >
            <img
              src={getImageUrl(image.file_path, "w500")}
              alt={`Gallery backdrop ${index + 1} for ${movieTitle}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieGallery;
