const sdk = require("node-appwrite");
const axios = require("axios");
const { join } = require("path");

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
  const account = new sdk.Account(client);
  const avatars = new sdk.Avatars(client);
  const database = new sdk.Databases(client);
  const functions = new sdk.Functions(client);
  const health = new sdk.Health(client);
  const locale = new sdk.Locale(client);
  const storage = new sdk.Storage(client);
  const teams = new sdk.Teams(client);
  const users = new sdk.Users(client);

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

  /**
   * @typeof {Object}
   * @property {string[]} boards
   * @property {number} limit
   * @example
   * {
   * "boards": ["g", "b", "pol"],
   * "limit": 10
   * }
   */
  let payload;
  try {
    payload = JSON.parse(req.payload);
    console.log(payload);
  } catch (error) {
    console.log("err: ", error);
  }

  const batch = [];
  for (const board of payload.boards) {
    const p = chan4(board, payload.limit);
    batch.push(p);
  }
  const data = await Promise.all(batch);

  const da = {
    image: [],
    gif: [],
    text_other: [],
    count: 0,
  };
  try {
    data.forEach((d) => {
      da.image = [...da.image, ...d.image];
      da.gif = [...da.gif, ...d.gif];
      da.text_other = [...da.text_other, ...d.text_other];
      da.count += d.count;
    });
  } catch (error) {
    console.log("err: ", error);
  }

  res.json({
    service: "chan4",
    urls: da,
  });
};

/**
 * @typedef {Object} DataObject
 * @property {Array<string>} image - Array of image URLs.
 * @property {Array<string>} gif - Array of GIF URLs.
 * @property {Array<string>} text_other - Array of other text data.
 * @property {number} count - Number indicating the count.
 */

/**
 *
 * @param {string[]} boards
 * @param {number} limit
 * Returns a data object.
 * @returns {Promise<DataObject>} The data object.
 */
const chan4 = async (board, limit) => {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
  };
  const response = await axios.get(`https://a.4cdn.org/${board}/catalog.json`, {
    headers: headers,
  });
  const pages = response.data;

  const data = {
    image: [],
    gif: [],
    text_other: [],
    count: 0,
  };

  for (const page of pages) {
    if (data.count >= limit) break;
    for (const thread of page.threads) {
      if (data.count >= limit) break;

      // main thread
      if (thread.tim && thread.ext) {
        const url = `https://i.4cdn.org/${board}/${thread.tim}${thread.ext}`;
        switch (thread.ext) {
          case ".gif":
            data.gif.push(url);
            data.count++;
            break;

          default:
            data.image.push(url);
            data.count++;
            break;
        }
      } else {
        data.text_other.push(thread.com || "");
        data.count++;
      }

      // sub thread
      // const threadResponse = await axios.get(
      //   `https://a.4cdn.org/${board}/thread/${thread.no}.json`
      // );
      // const posts = threadResponse.data.posts;
      // for (const post of posts) {
      //   if (data.count >= limit) break;
      //   if (post.tim && post.ext) {
      //     const url = `https://i.4cdn.org/${board}/${post.tim}${post.ext}`;
      //     switch (post.ext) {
      //       case ".gif":
      //         data.gif.push(url);
      //         data.count++;
      //         break;

      //       default:
      //         data.image.push(url);
      //         data.count++;
      //         break;
      //     }
      //   } else {
      //     data.text_other.push(post.com || "");
      //     data.count++;
      //   }
      // }
    }
  }

  return data;
};
