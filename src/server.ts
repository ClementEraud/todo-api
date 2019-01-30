import dbConnection from "./dbConnection";
import * as express from "express";
import * as graphqlHTTP from "express-graphql";
import { initTodos, todoSchema, todoRoot } from "./models/TodoModel";

dbConnection();
initTodos();

const app = express();
app.use(
  "/todo",
  graphqlHTTP({
    schema: todoSchema,
    rootValue: todoRoot,
    graphiql: true
  })
);
app.listen(4000, () => console.log("Now browse to localhost:4000/todo"));
