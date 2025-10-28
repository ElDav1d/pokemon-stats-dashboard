import React from "react";

interface LoadingMessageProps {
  message: string;
}

const LoadingMessage: React.FC<LoadingMessageProps> = ({ message }) => {
  return (
    <h3 className="text-center my-4 text-gray-500">{message}</h3>
  );
};

export default LoadingMessage;
