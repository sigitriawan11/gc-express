import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
    origin: [process.env.CORS_URL!],
    credentials: true,
  }));
app.use(express.json());

export default app;