const sdk = require("node-appwrite");

module.exports = async function (req, res) {
  const client = new sdk.Client();

  client
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("6463a34a73ca03c70d35")
    .setKey(
      "8e2d4eb0b3a64642fcaa0163302bf185053e28fa015c6c2b654e0f313afa07abd709347fcfbac4584c16bfe00df5760daa3f728ed10f6f042fc900fc41283a2601758c446d5673b987b686ccf951deba9e463d9bfff06a3f9f6e722634b984005f0c5898eb9848c63f16d77ca1d56c2d4dbae51abe6000ea35d16d474d66e64f"
    );

  const account = new sdk.Account(client);
  const database = new sdk.Databases(client);
  const functions = new sdk.Functions(client);
  const storage = new sdk.Storage(client);
  const users = new sdk.Users(client);

  // creates and updates a document (646a0db35166b90f8226)
  /**
   * urlsJSON: 646a0db35166b90f8226
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
        "646a0db35166b90f8226",
        "647e4ce8443227511022",
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
        "646a0db35166b90f8226",
        "647e4d8dc67145c82745",
        [sdk.Query.equal("bucketId", [payload.bucketId, payload.topic])]
      );

      if (total > 0) {
        // update the document
        try {
          const doc = await database.updateDocument(
            "646a0db35166b90f8226",
            "647e4d8dc67145c82745",
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
            "646a0db35166b90f8226",
            "647e4d8dc67145c82745",
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
