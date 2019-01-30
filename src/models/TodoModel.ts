import { Schema, model } from "mongoose";
import { buildSchema } from "graphql";

//MongoDB Model
const TodoSchema = new Schema({
  title: String,
  description: String
});

export const TodoModel = model("Todo", TodoSchema);


// GraphQL schema and root

// methods
const standardCallback = (err: Error, res: any) => {
  if (err) {
    console.error(err);
    return err;
  }
  return res;
};

const getAll = () => TodoModel.find(standardCallback);

const getTodoById = ({ id }: { id: String }) => {
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    return TodoModel.findById(id, standardCallback);
  } else {
    return "Not a valid ObjectID";
  }
};

// declaration
export const todoSchema = buildSchema(`
    type Todo {
        _id: ID,
        title: String,
        description: String
    }

    type Query {
        getAll: [Todo],
        getTodoById(id: ID): Todo
    }
`);

export const todoRoot = {
  getAll: getAll,
  getTodoById: getTodoById
};


// Temp func adds 2 todos at start
export const initTodos = () => {
  TodoModel.create({
    title: "Item 1",
    description: "do item 1"
  });

  TodoModel.create({
    title: "Item 2",
    description: "do item 2"
  });
};
