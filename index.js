import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import seedDiscussion from "./routes/seedDiscussion.js"
import authRoutes from "./routes/auth.js"
import cookieParser from 'cookie-parser';

dotenv.config();

const app=express()
const PORT=process.env.PORT || 3002
app.use(cookieParser());

app.use(express.json())
app.use(cors({
    credentials: true,
    origin: "http://localhost:3000",
}));


app.use("/seedDiscussion",seedDiscussion);
app.use("/auth", authRoutes);

app.use("/",(req,res)=>{
    res.status(200).json({"status":"success"})
})

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})