import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import sdk, { ID } from "node-appwrite";

// Init SDK
const client = new sdk.Client();

const databases = new sdk.Databases(client);

client
  .setEndpoint("https://cloud.appwrite.io/v1") // Your API Endpoint
  .setProject(process.env.PROJECT_ID as string) // Your project ID
  .setKey(process.env.SECRET_KEY as string); // Your secret API key

export const appwriteRouter = createTRPCRouter({
  createCollection: publicProcedure
    .input(
      z.object({
        collectionName: z.string(), // going to be the name of the user
      })
    )
    .mutation(async ({ input }) => {
      const promise = await databases.createCollection(
        "646a0f5d434c20bf1963",
        ID.unique(),
        input.collectionName
      );

      return {
        collectionID: promise.$id,
      };
    }),
});
