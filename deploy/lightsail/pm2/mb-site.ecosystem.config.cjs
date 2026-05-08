/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

const appDir = process.env.APP_DIR || path.resolve(__dirname, "../../..");

module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || "mb-site",
      cwd: appDir,
      script: "npm",
      args: "start",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || "3001",
        HOSTNAME: process.env.HOSTNAME || "127.0.0.1",
        NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED || "1",
      },
      autorestart: true,
      max_restarts: 10,
      exp_backoff_restart_delay: 100,
    },
  ],
};
