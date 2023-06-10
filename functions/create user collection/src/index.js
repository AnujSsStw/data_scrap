const sdk = require("node-appwrite");

/*
  'req' variable has:
    'headers' - object with request headers
    'payload' - request body data as a string
    'variables' - object with function variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200

  If an error is thrown, a response with code 500 will be returned.
*/

module.exports = async function (req, res) {
  const client = new sdk.Client();

  // You can remove services you don't use
  const database = new sdk.Databases(client);

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

  const DatabaseID = "646a0f5d434c20bf1963";
  try {
    // not check if the APPWRITE_FUNCTION_EVENT_DATA is empty because it only runs when a user is created(user.*.create)
    const userData = JSON.parse(req.variables.APPWRITE_FUNCTION_EVENT_DATA);
    const user = userData.$id;

    // create a collection for the new user
    const promise = database.createCollection(DatabaseID, user, userData.name, [
      sdk.Permission.create(sdk.Role.users()),
      sdk.Permission.read(sdk.Role.users()),
      sdk.Permission.update(sdk.Role.users()),
    ]);

    promise
      .then(async function (response) {
        console.log(response);

        // create attributes for the new collection
        const q = database.createStringAttribute(
          DatabaseID,
          response.$id,
          "q",
          30,
          false
        );

        const last_limit = database.createIntegerAttribute(
          DatabaseID,
          response.$id,
          "last_limit",
          false,
          0,
          undefined,
          0
        );

        const rawBucketId = database.createStringAttribute(
          DatabaseID,
          response.$id,
          "rawBucketId",
          30,
          false
        );

        const jsonBucketUrl = database.createUrlAttribute(
          DatabaseID,
          response.$id,
          "jsonBucketUrl",
          false
        );

        const selected_s = database.createStringAttribute(
          DatabaseID,
          response.$id,
          "selected_s",
          30,
          false,
          undefined,
          true
        );

        await Promise.all([
          q,
          last_limit,
          rawBucketId,
          jsonBucketUrl,
          selected_s,
        ]);

        while (true) {
          try {
            await database.getattribute(DatabaseID, response.$id, "q");
            await database.getattribute(DatabaseID, response.$id, "selected_s");
            break;
          } catch (e) {
            await sleep(1000);
          }
        }

        await database.createIndex(
          DatabaseID,
          response.$id,
          "querySearch",
          "fulltext",
          ["q", "selected_s"],
          ["ASC", "ASC"]
        );
      })
      .catch(function (error) {
        console.log("erro while creating : ", error);
      });
  } catch (error) {
    console.error("Error parsing payload", error);
  }

  res.send("created an collection for new user", 200);
};
