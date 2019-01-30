import { Schema, model } from "mongoose";
import { buildSchema } from "graphql";
import { checkID } from '../utils';

interface TodoParams {
  id ?: string,
  newTodo ?: TodoInput
}

interface TodoInput {
  title: string,
  description: string
}

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

const getTodoById = ({ id }: { id: string }) => {
  if (checkID(id)) {
    return TodoModel.findById(id, standardCallback);
  } else {
    return "Not a valid ObjectID";
  }
};

const createTodo = async ({ newTodo }: TodoParams) => {
  const todo = new TodoModel(newTodo);

  try {
    await todo.save();
    return todo;
  } catch (err) {
    console.error(err);
    return err;
  }
};

const updateTodo = ({ id, newTodo }: TodoParams) => {
  if (checkID(id)) {
    return TodoModel.findByIdAndUpdate(
      id,
      newTodo,
      { new: true },
      standardCallback
    );
  } else {
    return "Not a valid ObjectID";
  }
};

const deleteTodo = ({ id }: TodoParams) => {
  if (checkID(id)) {
    return TodoModel.findByIdAndDelete(id, standardCallback);
  } else {
    return "Not a valid ObjectID";
  }
}

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
        createTodo(newTodo: TodoInput): Todo,
        updateTodo(id: ID, newTodo: TodoInput): Todo,
        deleteTodo(id: ID): String
    }
`);

//Root Declaration
export const todoRoot = {
  getAllTodos: getAllTodos,
  getTodoById: getTodoById,
  createTodo: createTodo,
  updateTodo: updateTodo,
  deleteTodo: deleteTodo
};
