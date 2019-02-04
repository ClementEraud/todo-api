import { Schema, model, Document } from "mongoose";
import { buildSchema } from "graphql";
import { IncomingMessage } from "http";

interface User extends Document {
  login: string;
  password: string;
  todos: [Todo];
}

interface Todo {
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
    }
`);

export const userRoot = {
  login: async ({login, password}: {login: string, password: string}) => {
    return await UserModel.findOne({ login: login, password: password });
  }
};
