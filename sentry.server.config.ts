// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://7057e6b27054d37465bc605aeb874b5b@o4511286622355456.ingest.de.sentry.io/4511427760554064",

  // Sample 10% of traces in production for performance
  tracesSampleRate: 0.1,

  // Capture all errors but sample performance traces
  enableLogs: true,

  // Disable PII for privacy compliance
  sendDefaultPii: false,
});
