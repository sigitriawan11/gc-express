import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

export default app;