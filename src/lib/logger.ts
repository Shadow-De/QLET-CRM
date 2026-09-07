import pino from "pino";

// PII-safe serializers — strip personal data fields from log output
const pinoOptions: pino.LoggerOptions = {
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      // Deliberately omit headers, body — could contain PII
    }),
    err: pino.stdSerializers.err,
  },
  // In dev, use pretty printing. In prod, use JSON (for log aggregators).
  ...(process.env.NODE_ENV !== "production" && {
    transport: {
      target: "pino-pretty",
      options: { colorize: true, ignore: "pid,hostname" },
    },
  }),
};

export const logger = pino(pinoOptions);
