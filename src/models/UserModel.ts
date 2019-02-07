import { Schema, model, Document, HookNextFunction } from "mongoose";
import { buildSchema } from "graphql";
import * as bcrypt from "bcrypt";

interface User extends Document {
  username: string;
  password: string;
  todos?: [Todo];
}

interface UserParams {
  _id?: string;
  newUser?: UserInput;
}

interface UserInput {
  username: string;
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
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  todos: [
    {
      title: String,
      description: String
    }
  ]
});

UserSchema.pre("save", function(next: HookNextFunction) {
  const user: User = <User>this;
  const SALT_WORK_FACTOR = 10;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err: Error, salt: string) {
    if (err) return next(err);

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err: Error, hash: string) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

const UserModel = model("User", UserSchema);

export const userSchema = buildSchema(`
    type Todo {
        _id: ID,
        title: String,
        description: String
    }

    type User {
        _id: ID,
        username: String,
        password: String,
        todos: [Todo]
    }

    type Query {
        login(username: String, password: String): User
        findById(_id: ID): User
    }

    input UserInput {
        username: String,
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
  login: async ({ username, password }: UserInput) => {
    try {
      const user: User = <User>await UserModel.findOne({ username: username });
      const same: boolean = await bcrypt.compare(password, user.password);

      if (!same) throw new Error("Wrong Password");

      return user;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  findById: async ({ _id }: UserParams) => {
    return await UserModel.findById(_id);
  },
  createUser: async ({ newUser }: UserParams) => {
    return await UserModel.create(newUser);
  },
  createTodo: async ({ userID, newTodo }: TodoParams) => {
    return await UserModel.findByIdAndUpdate(
      userID,
      {
        $push: { todos: newTodo }
      },
      {
        new: true,
      });
  },
  deleteTodo: async ({ userID, todoID }: TodoParams) => {
    return await UserModel.findByIdAndUpdate(
      userID,
      {
        $pull: { todos: { _id: todoID } }
      },
      {
        new: true
      });
  },
  updateTodo: async ({ userID, todoID, newTodo }: TodoParams) => {
    return await UserModel.findOneAndUpdate(
      { _id: userID, "todos._id": todoID },
      {
        $set: {
          "todos.$.title": newTodo.title,
          "todos.$.description": newTodo.description
        }
      },
      {
        new: true
      });
  }
};
