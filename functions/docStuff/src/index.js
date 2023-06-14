const sdk = require("node-appwrite");

module.exports = async function (req, res) {
  const client = new sdk.Client();

  if (
    !req.variables["APPWRITE_FUNCTION_ENDPOINT"] ||
    !req.variables["APPWRITE_FUNCTION_API_KEY"]
  ) {
    console.warn(
      "Environment variables are not set. Function cannot use Appwrite SDK."
    );
  } else {
    client
      .setEndpoint(req.variables["APPWRITE_FUNCTION_ENDPOINT"])
      .setProject(req.variables["APPWRITE_FUNCTION_PROJECT_ID"])
      .setKey(req.variables["APPWRITE_FUNCTION_API_KEY"])
      .setSelfSigned(true);
  }

  const account = new sdk.Account(client);
  const database = new sdk.Databases(client);
  const functions = new sdk.Functions(client);
  const storage = new sdk.Storage(client);
  const users = new sdk.Users(client);

  // creates and updates a document (6488480242f3b85a5c4e)
  /**
   * urlsJSON: 6488480242f3b85a5c4e
   * rawData: 647e4d8dc67145c82745
   * csv: 647e4feedfcba65834ab
   */
  /**
   * @type {Object}
   * @property {string} bucketId
   * @property {number} TotalCount
   * @property {string} topic
   * @property {string} dataType
   */
  let payload;
  try {
    payload = JSON.parse(req.payload);
    console.log(payload);
  } catch (error) {
    console.log("error while handling payload");
  }

  if (payload.dataType === "raw") {
    await rawDoc();
  } else if (payload.dataType === "json") {
    await jsonDoc();
  } else {
    console.log("error while handling payload");
  }

  // for these functions we need to create a document and then upload the file to it dnd it is generally called from client side

  async function jsonDoc() {
    //     docStuffData = {"bucketUrl": url, "topic": payload["q"], "dataType": "json"}
    // create a document
    try {
      const doc = await database.createDocument(
        "6488480242f3b85a5c4e",
        "6488482a873f910b09df",
        sdk.ID.unique(),
        {
          bucketUrl: payload.bucketUrl,
          ofTopic: payload.topic,
        }
      );
      console.log("doing json doc update", doc);
    } catch (error) {
      console.log("error while creating json doc", error);
    }
  }

  // actuall creating of the data is done by l1 it's just the doc that needs to be created
  async function rawDoc() {
    //check if the document exists
    try {
      const { documents, total } = await database.listDocuments(
        "6488480242f3b85a5c4e",
        "6488481a124ee5bcb962",
        [sdk.Query.equal("bucketId", [payload.bucketId, payload.topic])]
      );

      if (total > 0) {
        // update the document
        try {
          const doc = await database.updateDocument(
            "6488480242f3b85a5c4e",
            "6488481a124ee5bcb962",
            documents[0].$id,
            {
              TotalCount: payload.TotalCount + documents[0].TotalCount,
            }
          );

          console.log(" while updating the doc", doc);
        } catch (error) {
          console.log(" while updating the doc", error);
        }
      } else {
        // create a document
        try {
          const doc = await database.createDocument(
            "6488480242f3b85a5c4e",
            "6488481a124ee5bcb962",
            sdk.ID.unique(),
            {
              bucketId: payload.bucketId,
              TotalCount: payload.TotalCount,
              topic: payload.topic,
            }
          );

          console.log(" while updating the doc", doc);
        } catch (error) {
          console.log(" while updating the doc", error);
        }
      }
    } catch (error) {
      console.log(" while updating the doc", error);
    }
  }

  res.json({
    areDevelopersAwesome: true,
  });
};
