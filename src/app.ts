import dotenv from "dotenv";
dotenv.config();
import express from "express";
import indexRouter from "./routes";
import connectToDB from "./utils/services/dbConnect";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

connectToDB();

const allowedOrigins = [
  "http://localhost:3000",
  "https://my-blog-front-dr6g.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", indexRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
