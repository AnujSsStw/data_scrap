const { Client, Storage, InputFile, ID } = require("node-appwrite");
const axios = require("axios");
const { Readable } = require("stream");

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("648841eb86516a2bef68")
  .setKey(
    "d39df74199ec12be4496e1bce1c7df4a073b92e8ee2a1f58553a54af859a732759a48697e855304dc69b2882376161ca4ecbfd6350a122a92b1988ccff9ebced3f9772c9cb46f7624b7132bde505623804b83c99bf100e5543dd4e81f19af377f3765beaf528006c09b2285fe8166346757e080d1a073574cae96832e80c518e"
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
