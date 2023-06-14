import {
  Account,
  Avatars,
  Client,
  Databases,
  Functions,
  Storage,
} from "appwrite";

export const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("648841eb86516a2bef68");

export const account = new Account(client);

export const databases = new Databases(client);

export const avatars = new Avatars(client);

export const functions = new Functions(client);

export const storage = new Storage(client);
