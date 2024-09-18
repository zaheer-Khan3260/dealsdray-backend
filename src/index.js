import dotenv from "dotenv"
import connectDatabase from "../database/index.js"
import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"


const server = express();

dotenv.config({
    path: './env'
});

console.log("Cors origin env", process.env.CORS_ORIGIN);

const corsOptions = {
    origin: [process.env.CORS_ORIGIN, "http://localhost:5173"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    allowedHeaders: "Content-Type, Authorization, X-Requested-With",
    preflightContinue: false,
    optionsSuccessStatus: 204
};

server.use(cors(corsOptions));


server.get("/", (req, res) => {
    res.send("Hello World from Vite and Express");

})

connectDatabase()
.then(() => {
    server.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDB connection failed !!!", err);
})

server.get("/test", (req, res) => {
    res.send(`Server is running upto date`);    
})

server.use(express.json( {limit: "16kb"}))
server.use(express.urlencoded({extended: true, limit: "16kb"}));
server.use(express.static("public"))
server.use(cookieParser());



import userRoutes from "./routes/user.routes.js"
import employeeRouter from "./routes/employee.routes.js"


server.use("/api/users", userRoutes)
server.use("/api/employees", employeeRouter);