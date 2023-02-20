const dotenv = require("dotenv");
const connectDB = require("./config/DB");

dotenv.config({
  path: "./config.env"
});

const app = require("./app");

// connectDB();

const PORT = 5001;
app.listen(PORT, console.log(`Server running on port: ${PORT}`));
