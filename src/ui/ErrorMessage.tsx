import React from "react";

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <h3 className="text-center my-4 text-red-500">{message}</h3>
  );
};

export default ErrorMessage;
