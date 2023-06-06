const { Client, Storage, InputFile, ID } = require("node-appwrite");
const async = require("async");
const axios = require("axios");

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6463a34a73ca03c70d35")
  .setKey(
    "8e2d4eb0b3a64642fcaa0163302bf185053e28fa015c6c2b654e0f313afa07abd709347fcfbac4584c16bfe00df5760daa3f728ed10f6f042fc900fc41283a2601758c446d5673b987b686ccf951deba9e463d9bfff06a3f9f6e722634b984005f0c5898eb9848c63f16d77ca1d56c2d4dbae51abe6000ea35d16d474d66e64f"
  )
  .setSelfSigned(true);

const storage = new Storage(client);

module.exports = async function (req, res) {
  // process.env.UV_THREADPOOL_SIZE = 6;
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  try {
    /**
     * @type{string[]} payload
     */
    const payload = JSON.parse(req.payload);
    console.log(payload);
  } catch (error) {
    console.log("err: ", error);
  }

  res.json({
    areDevelopersAwesome: true,
  });
};

function downloadContentAsBlob(url, callback) {
  getFileSize(url).then((size) => {
    if (size < 1000000 || size !== null) {
      axios
        .get(url, { responseType: "arraybuffer" })
        .then((response) => response.data)
        .then((blob) => {
          // const fileName = url.split("/").pop();
          // const s = storage.createFile(
          //   "647c742e7ae47318cac4",
          //   ID.unique(),
          //   InputFile.fromBuffer(blob, fileName)
          // );
          uploadFileToAppwriteParallel(blob, fileName, (error, response) => {
            if (error) {
              console.error("Error: ara ap", error);
              return;
            }
            console.log("Upload complete!", response);
          });
          callback(null, blob);
        })
        .catch((error) => callback(error));
    }
  });
}

function uploadFileToAppwriteParallel(blob, fileName, callback) {
  const file = InputFile.fromBuffer(blob, fileName);
  async.parallel(
    [
      (callback) =>
        storage
          .createFile("647c742e7ae47318cac4", ID.unique(), file)
          .then((response) => callback(null, response))
          .catch((error) => callback(error)),
    ],
    callback
  );
}

function downloadContentInParallel(urls, callback) {
  async.parallel(
    urls.map((url) => (callback) => downloadContentAsBlob(url, callback)),
    callback
  );
}

async function getFileSize(url) {
  try {
    const response = await axios.head(url);
    const contentLength = response.headers["content-length"];
    return response.headers.hasOwnProperty("content-length") && contentLength;
  } catch (error) {
    // console.error("Error: ara me", error.message);
    return null;
  }
}
