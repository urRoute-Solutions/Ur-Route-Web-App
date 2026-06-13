import winston from "winston";

/**
 * Structured JSON logger. JSON in all envs so log drains (Better Stack /
 * Grafana Loki) can parse fields; a readable console transport is added in dev.
 * Never log secrets, tokens, or password hashes.
 */
const isProd = process.env.NODE_ENV === "production";

export const logger = winston.createLogger({
  level: isProd ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "urroute" },
  transports: [
    new winston.transports.Console({
      format: isProd
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
    }),
  ],
});
