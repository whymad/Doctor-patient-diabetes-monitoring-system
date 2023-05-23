require("dotenv").config();

// connect to mongodb
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URL || "mongodb://localhost", {
    dbName: "Diabetes@Home",
  })
  .then(() => console.log("connected to Mongo"))
  .catch((err) => console.log(err, "\nfailed to connect to Mongo"));