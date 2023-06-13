import {
  Account,
  Avatars,
  Client,
  Databases,
  Functions,
  Storage,
} from "appwrite";

export const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") // Your API Endpoint
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID as string); // Your project ID

export const account = new Account(client);

export const databases = new Databases(client);

export const avatars = new Avatars(client);

export const functions = new Functions(client);

export const storage = new Storage(client);
