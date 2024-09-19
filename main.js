// imports 
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

// connect to mongodb
mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session ({
  secret: 'my secret key',
  saveUninitialized: true,
  resave: false,
}));

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

//set the uploads folder as static
app.use(express.static("uploads"));

// set template engine
app.set("view engine", "ejs");
app.use(express.static("public"));


// routes prefix
app.use("", require("./routes/routes.js"));


app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});