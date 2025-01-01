import cookieParser from "cookie-parser";
import express from "express";
import cors from 'cors';
import userRoutes from './routes/routes';
import { V1_USER_BASE_ROUTE } from "./routes/constants";

const app = express();
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        // Todo: Find type
        //   credential: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());
app.use(V1_USER_BASE_ROUTE, userRoutes);

export default app;
