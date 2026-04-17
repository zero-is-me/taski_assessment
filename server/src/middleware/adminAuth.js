import ApiError from "../utils/ApiError.js";

const adminAuth = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    return next(new ApiError(403, "Forbidden", "Admin access required"));
  }

  next();
};

export default adminAuth;
