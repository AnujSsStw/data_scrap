const { Client, Storage, InputFile, ID } = require("node-appwrite");
const axios = require("axios");
const { Readable } = require("stream");

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6463a34a73ca03c70d35")
  .setKey(
    "8e2d4eb0b3a64642fcaa0163302bf185053e28fa015c6c2b654e0f313afa07abd709347fcfbac4584c16bfe00df5760daa3f728ed10f6f042fc900fc41283a2601758c446d5673b987b686ccf951deba9e463d9bfff06a3f9f6e722634b984005f0c5898eb9848c63f16d77ca1d56c2d4dbae51abe6000ea35d16d474d66e64f"
  );

const storage = new Storage(client);

module.exports = async function (req, res) {
  try {
    /**
     * @type {{urls: {
     *   image: string[],
     * },
     * bucketId: string}}
     */
    const payload = JSON.parse(req.payload);

    await downloadAndUpload(payload.urls.image, payload.bucketId);
    // can use batch upload if the image array is too large currently it only 10 urls
  } catch (error) {
    console.log("err: ", error);
  }

  res.json({
    areDevelopersAwesome: true,
  });
};

async function downloadAndUpload(urls, bucketId) {
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
