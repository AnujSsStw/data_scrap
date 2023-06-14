import {
  Account,
  Avatars,
  Client,
  Databases,
  Functions,
  Storage,
} from "appwrite";

export const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_API_ENDPOINT as string)
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID as string);

export const account = new Account(client);

export const databases = new Databases(client);

export const avatars = new Avatars(client);

export const functions = new Functions(client);

export const storage = new Storage(client);
