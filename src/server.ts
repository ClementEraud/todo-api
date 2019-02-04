import dbConnection from "./dbConnection";
import * as express from "express";
import * as graphqlHTTP from "express-graphql";
import { todoSchema, todoRoot } from "./models/TodoModel";
import * as cors from "cors";
import { userSchema, userRoot } from "./models/UserModel";

dbConnection();

const app = express();
app.use(cors());

app.use(
  "/todo",
  graphqlHTTP({
    schema: todoSchema,
    rootValue: todoRoot,
    graphiql: true
  })
);

app.use(
  "/user",
  graphqlHTTP({
    schema: userSchema,
    rootValue: userRoot,
    graphiql: true,
  })
);

app.listen(4000, () => console.log("Now browse to localhost:4000/todo"));
