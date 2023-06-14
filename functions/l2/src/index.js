const { Client, Storage, InputFile, ID } = require("node-appwrite");
const axios = require("axios");
const { Readable } = require("stream");

module.exports = async function (req, res) {
  const client = new Client();
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

  const storage = new Storage(client);

  try {
    /**
     * @type {{urls: {
     *   image: string[],
     * },
     * bucketId: string}}
     */
    const payload = JSON.parse(req.payload);

    await downloadAndUpload(payload.urls.image, payload.bucketId, storage);
    // can use batch upload if the image array is too large currently it only 100 urls
  } catch (error) {
    console.log("err: ", error);
  }

  res.json({
    areDevelopersAwesome: true,
  });
};

async function downloadAndUpload(urls, bucketId, storage) {
  const pp = urls.map(async (url, i) => {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
      });
      const fileName = url.split("/").pop();
      const file = new InputFile(
        Readable.from(response.data),
        fileName,
        Buffer.byteLength(response.data)
      );

      return await storage.createFile(bucketId, ID.unique(), file);
    } catch (error) {
      console.error("Error fetching or uploading files:", error);
      return null;
    }
  });

  await Promise.all(pp);
}
