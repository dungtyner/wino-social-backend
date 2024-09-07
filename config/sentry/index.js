// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');
require('dotenv').config();

const configureSentry = (app) => {
  Sentry.init({
    dsn: process.env.DSN_SENTRY,
    integrations: [nodeProfilingIntegration()],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions

    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });

  // Optional fallthrough error handler
  // eslint-disable-next-line no-unused-vars
  app.use(function onError(err, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.end(res.sentry + '\n');
  });

  // eslint-disable-next-line no-unused-vars
  app.get('/debug-sentry', function mainHandler(req, res) {
    throw new Error('My first Sentry error!');
  });
};

module.exports = configureSentry;
