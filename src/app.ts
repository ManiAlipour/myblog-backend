import dotenv from "dotenv";
dotenv.config();
import express from "express";
import indexRouter from "./routes";
import connectToDB from "./utils/services/dbConnect";

const app = express();
const PORT = process.env.PORT || 3000;

connectToDB();

app.use(express.json());
app.use("/api", indexRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
