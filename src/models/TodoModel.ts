import { Schema, model } from "mongoose";
import { buildSchema } from "graphql";

//MongoDB Model
const TodoSchema = new Schema({
  title: String,
  description: String
});

export const TodoModel = model("Todo", TodoSchema);

// GraphQL schema and root

// Methods Implementation
const standardCallback = (err: Error, res: any) => {
  if (err) {
    console.error(err);
    return err;
  }
  return res;
};

const getAllTodos = () => TodoModel.find(standardCallback);

const getTodoById = ({ id }: { id: String }) => {
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    return TodoModel.findById(id, standardCallback);
  } else {
    return "Not a valid ObjectID";
  }
};

const createTodo = async ({ newTodo }: any) => {
  const todo = new TodoModel(newTodo);

  try {
    await todo.save();
    return todo;
  } catch (err) {
    console.error(err);
    return err;
  }
};

// Schema Declaration
export const todoSchema = buildSchema(`
    type Todo {
        _id: ID,
        title: String,
        description: String
    }

    type Query {
        getAllTodos: [Todo],
        getTodoById(id: ID): Todo
    }

    input TodoInput {
        title: String,
        description: String
    }

    type Mutation {
        createTodo(newTodo: TodoInput): Todo
    }
`);

//Root Declaration
export const todoRoot = {
  getAllTodos: getAllTodos,
  getTodoById: getTodoById,
  createTodo: createTodo
};
