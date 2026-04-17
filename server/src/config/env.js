const neededVars = ["MONGODB_URI", "JWT_SECRET"];

export const validateEnv = () => {
  const missing = neededVars.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
};
