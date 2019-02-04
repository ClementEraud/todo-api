import { Schema, model, Document } from "mongoose";
import { buildSchema } from "graphql";

interface User extends Document {
  login: string;
  password: string;
  todos?: [Todo];
}

interface UserParams {
  _id?: string;
  newUser?: UserInput;
}

interface UserInput {
  login: string;
  password: string;
}

interface Todo {
  _id: string;
  title: string;
  description: string;
}

interface TodoParams {
  userID: string;
  todoID?: string;
  newTodo?: TodoInput;
}

interface TodoInput {
  title: string;
  description: string;
}

//MongoDB Model
const UserSchema = new Schema({
  login: String,
  password: String,
  todos: [
    {
      title: String,
      description: String
    }
  ]
});

const UserModel = model("User", UserSchema);

export const initUser = () => {
  UserModel.create({
    login: "login",
    password: "password",
    todos: [
      {
        title: "Item 1",
        description: "do Item 1"
      }
    ]
  });
};

export const userSchema = buildSchema(`
    type Todo {
        _id: ID,
        title: String,
        description: String
    }

    type User {
        _id: ID,
        login: String,
        password: String,
        todos: [Todo]
    }

    type Query {
        login(login: String, password: String): User
        findById(_id: ID): User
    }

    input UserInput {
        login: String,
        password: String
    }

    input TodoInput {
        title: String,
        description: String
    }

    type Mutation {
        createUser(newUser: UserInput): User,
        createTodo(userID: ID, newTodo: TodoInput): User,
        deleteTodo(userID: ID, todoID: ID): User,
        updateTodo(userID: ID, todoID: ID, newTodo: TodoInput): User
    }
`);

export const userRoot = {
  login: async ({ login, password }: { login: string; password: string }) => {
    return await UserModel.findOne({ login: login, password: password });
  },
  findById: async ({ _id }: UserParams) => {
    return await UserModel.findById(_id);
  },
  createUser: async ({ newUser }: UserParams) => {
    return await UserModel.create(newUser);
  },
  createTodo: ({ userID, newTodo }: TodoParams) => {
    return UserModel.findByIdAndUpdate(
      userID,
      {
        $push: { todos: newTodo }
      },
      (_err: Error, user: User) => user
    );
  },
  deleteTodo: ({ userID, todoID }: TodoParams) => {
    return UserModel.findByIdAndUpdate(
      userID,
      {
        $pull: { todos: { _id: todoID } }
      },
      (_err, user) => user
    );
  },
  updateTodo: ({ userID, todoID, newTodo }: TodoParams) => {
    return UserModel.findOneAndUpdate(
      { _id: userID, "todos._id": todoID },
      {
        $set: {
          "todos.$.title": newTodo.title,
          "todos.$.description": newTodo.description
        }
      },
      (_err, user: User) => user
    );
  }
};
