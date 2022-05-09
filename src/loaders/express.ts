import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from '../api';
import config from '../config';
import ActualError from '../exceptions/actual';
export default ({ app }: { app: express.Application }) => {
  app.get('/status', (req, res) => {
    res.status(200).end();
  });

  app.head('/status', (req, res) => {
    res.status(200).end();
  });

  app.get('/mode', (req, res) => {
    res.send(config.mode);
  });
  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable('trust proxy');
  // The magic package that prevents frontend developers going nuts
  // Alternate description:
  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());
  // Middleware to increase actual performance and prevent weird behaviour
  app.use(function(req, res, next) {
    res.header('Cross-Origin-Embedder-Policy', 'require-corp');
    res.header('Cross-Origin-Opener-Policy', 'same-origin');
    next();
  });
  // Middleware that transforms the raw string of req.body into json
  app.use(bodyParser.json({ limit: '20mb' }));
  // Middleware to accept actual specific files
  app.use(bodyParser.raw({ type: 'application/actual-sync', limit: '20mb' }));
  app.use(bodyParser.raw({ type: 'application/encrypted-file', limit: '50mb' }));
  // Load API routes
  app.use(routes());
  /// catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err['status'] = 404;
    next(err);
  });
  /// error handlers
  app.use((err, req, res, next) => {
    /**
     * Handle 401 thrown by express-jwt library
     */
    if (err.name === 'UnauthorizedError') {
      return res
        .status(401)
        .send({
          status: 'error',
          reason: 'unauthorized',
          details: 'token-not-found',
        })
        .end();
    }
    return next(err);
  });

  app.use((err, req, res, next) => {
    /**
     * Handle actual errors
     */
    if (err instanceof ActualError) {
      return res
        .status(400)
        .send({
          status: 'error',
          reason: err.message,
          details: err.details,
        })
        .end();
    }
    return next(err);
  });

  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        status: 'error',
        reason: 'internal-error',
        debug: [process.env.NODE_ENV !== 'production' ? err.message + err.stack : null],
      },
    });
  });
};
