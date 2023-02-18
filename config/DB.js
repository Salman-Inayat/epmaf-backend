const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URI).then((con) => {
      console.log(`DataBase Connected`);
    });
  } catch (error) {
    process.exit;
  }
};

module.exports = connectDB;

// const mongoose = require("mongoose");
// let DB_URL = process.env.MONGO_URI;

// module.exports = async function connection() {
//   try {
//     mongoose.connect(
//       DB_URL,
//       {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         useFindAndModify: false,
//         useCreateIndex: true,
//         autoIndex: true
//       },
//       (error) => {
//         if (error) return new Error("Failed to connect to database");
//         console.log("Database connected");
//       }
//     );
//   } catch (error) {
//     console.log(error);
//   }
// };
