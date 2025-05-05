import React, { useState, ChangeEvent, KeyboardEvent } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialQuery = "",
  placeholder = "Search movies...",
}) => {
  const [query, setQuery] = useState(initialQuery);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      handleSearchClick();
    }
  };

  const handleSearchClick = () => {
    onSearch(query.trim());
  };

  return (
    <div className="relative flex items-center w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
        aria-label="Search movies"
      />
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 cursor-pointer hover:text-teal-400"
        onClick={handleSearchClick}
        aria-label="Submit search"
      />
    </div>
  );
};

export default SearchBar;
