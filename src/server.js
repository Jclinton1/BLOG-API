const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { connect } = require("./database/connection/connection.js");
const app = require("./index.js");

dotenv.config();
MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;

mongoose.connect(MONGO_URL).then(() => {
  console.log("Connected to DB");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
