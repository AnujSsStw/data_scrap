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
    const promise = database.createCollection(
      DatabaseID,
      sdk.ID.unique(),
      user
    );

    promise.then(
      async function (response) {
        console.log(response);

        // create attributes for the new collection
        const att1 = database.createUrlAttribute(
          DatabaseID,
          response.$id,
          "txtUrl",
          false
        );

        const att2 = database.createIntegerAttribute(
          DatabaseID,
          response.$id,
          "count",
          false,
          undefined,
          undefined,
          0
        );

        await Promise.all([att1, att2]);
      },
      function (error) {
        console.log(error);
      }
    );
  } catch (error) {
    console.error("Error parsing payload", error);
  }

  res.send("created an collection for new user", 200);
};
