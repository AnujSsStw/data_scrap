import { Client, Account, ID, Databases, Avatars } from "appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") // Your API Endpoint
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID as string); // Your project ID

export const account = new Account(client);

export const databases = new Databases(client);

export const avatars = new Avatars(client);