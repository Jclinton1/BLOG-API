const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authenticationRoutes");
const blogRoutes = require("./routes/blogRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRoutes);
app.use("/blogs", blogRoutes);
app.use("/users", userRoutes);

module.exports = app;
