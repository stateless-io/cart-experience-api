import express, { type Express } from "express";
import { InMemorySalesforceCartClient } from "./salesforce/InMemorySalesforceCartClient";
import { registerCartRoutes } from "./routes/cartRoutes";

export function createApp(): Express {
  const app = express();
  const salesforceCartClient = new InMemorySalesforceCartClient();

  app.use(express.json());

  registerCartRoutes(app, { salesforceCartClient });

  return app;
}
