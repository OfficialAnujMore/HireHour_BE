import dotenv from "dotenv";
dotenv.config();
import app from './app';

const PORT = process.env.PORT || 5000;
console.log("DATABASE_URL:", process.env.DATABASE_URL);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
