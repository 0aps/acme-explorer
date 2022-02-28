import bodyParser from 'body-parser';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { dbConnection, dbClose } from './database.js';
import { actorRoutes } from '../routes/actorRoutes.js';
import { finderRoutes } from '../routes/finderRoutes.js';
import { applicationRoutes } from '../routes/applicationRoutes.js';
import { sponsorshipRoutes } from '../routes/sponsorshipRoutes.js';
import { tripRoutes } from '../routes/tripRoutes.js';
import { redisConnection, redisClose } from './redis.js';
import { dashboardRoutes } from '../routes/dashboardRoutes.js';

export class Server {
  constructor() {
    this.app = express();

    this.port = process.env.PORT || 8080;

    dbConnection();
    redisConnection();
  }

  middlewares() {
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());

    // End Points
    actorRoutes(this.app);
    finderRoutes(this.app);
    applicationRoutes(this.app);
    sponsorshipRoutes(this.app);
    tripRoutes(this.app);
    dashboardRoutes(this.app);

    this.app.use((err, req, res, next) => {
      if (err.code) {
        res.status(err.code).json(err.toClient());
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err.message);
      }
    });
    this.app.use((req, res) => {
      res.sendStatus(StatusCodes.NOT_FOUND);
    });
  }

  execute() {
    this.middlewares();
    this.instance = this.app.listen(this.port, () => {
      console.log('ACME-Explorer REST API server started on: ' + this.port);
    });
  }

  async close() {
    if (this.instance) {
      await this.instance.close();
    }
    await dbClose();
    await redisClose();
  }
}
