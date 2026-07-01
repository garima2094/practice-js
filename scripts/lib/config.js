const IS_PRODUCTION = process.env.NODE_ENV === "production";

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: IS_PRODUCTION,
  port: Number(process.env.PORT) || 3456,
  maxPortAttempts: IS_PRODUCTION ? 0 : 10,
  allowRun: IS_PRODUCTION
    ? process.env.ALLOW_RUN === "true"
    : process.env.ALLOW_RUN !== "false",
  runTimeoutMs: Number(process.env.RUN_TIMEOUT_MS) || 5000,
  maxOutputBytes: Number(process.env.MAX_OUTPUT_BYTES) || 64 * 1024,
};

module.exports = config;
