import * as mongoose from "mongoose";

export default function() {
  // Connection to MongoDB
  mongoose.connect(
    "mongodb+srv://admin:admin@cluster0-tgx0j.mongodb.net/todo?retryWrites=true",
    { useNewUrlParser: true }
  );

  // Bind connection to error event (to get notification of connection errors)
  mongoose.connection.on(
    "error",
    console.error.bind(console, "MongoDB connection error:")
  );
}
