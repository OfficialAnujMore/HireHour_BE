import cookieParser from "cookie-parser";
import express from "express";
import cors from 'cors';
import serviceRouter from './routes/serviceRoutes';
import routes from './routes/userRoutes';
import { V1_AUTH_BASE_ROUTE, V1_SERVICE_BASE_ROUTE, V1_USER_BASE_ROUTE } from "./routes/constants";
const { authRouter, userRouter } = routes;

const app = express();
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        // Todo: Find type
        //   credential: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());
app.use(V1_AUTH_BASE_ROUTE, authRouter)
app.use(V1_USER_BASE_ROUTE, userRouter);
app.use(V1_SERVICE_BASE_ROUTE,serviceRouter)

export default app;
