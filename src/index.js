import express from "express";



const app = express();
const PORT = 4500;

app.get("/", (req, res) => {
    res.send("Hello World from Vite and Express");

})


app.listen(PORT, (req, res) => {
    console.log(`Server running on port ${PORT}`);
 
})