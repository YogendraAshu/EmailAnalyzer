import express from "express"
import cors from "cors"
import authRouths from "./routes/authRoutes.js"
import emailRoutes from "./routes/emailRoutes.js";
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req,res) => {
    res.send("Backend server is running ");
})

app.use("/api/users", authRouths);
app.use("/api/email", emailRoutes);
export default app;