import React from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  className = "",
}) => {
  return (
    <div
      className={`bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-md relative flex items-center ${className}`}
      role="alert"
    >
      <AlertTriangle className="w-5 h-5 mr-3 text-red-300" />
      <div>
        <span className="block sm:inline font-semibold">Error:</span>
        <span className="ml-2">{message || "An unknown error occurred."}</span>
      </div>
    </div>
  );
};

export default ErrorMessage;
