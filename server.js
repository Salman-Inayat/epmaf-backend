const dotenv = require("dotenv");

dotenv.config({
  path: "./config.env"
});

const app = require("./app");

const PORT = 5001;
app.listen(PORT, console.log(`Server running on port: ${PORT}`));
