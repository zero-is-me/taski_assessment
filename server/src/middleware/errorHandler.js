import ApiError from "../utils/ApiError.js";

export const notFound = (_req, _res, next) => {
  next(new ApiError(404, "Not Found", "Route not found"));
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const error = err.error || "Internal Server Error";
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    error,
    message,
  });
};
