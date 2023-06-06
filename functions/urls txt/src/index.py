from appwrite.client import Client
import praw
import json
import random
import string
import re
import requests
import threading

from appwrite.input_file import InputFile
from appwrite.id import ID

# You can remove imports of services you don't use
from appwrite.services.account import Account
from appwrite.services.avatars import Avatars
from appwrite.services.databases import Databases
from appwrite.services.functions import Functions
from appwrite.services.health import Health
from appwrite.services.locale import Locale
from appwrite.services.storage import Storage
from appwrite.services.teams import Teams
from appwrite.services.users import Users

"""
  'req' variable has:
    'headers' - object with request headers
    'payload' - request body data as a string
    'variables' - object with function variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200

  If an error is thrown, a response with code 500 will be returned.
"""

API_CLIENT = "DIh7RjYEWFD7owiTja0OGQ"
API_SECRET = "KG8WVc51LIojuSdYDfPZAQRc0EzErA"
REDDIT_USERNAME = "AnujSsSs"
REDDIT_PASSWORD = "6TY@6_Pu6h8-tmw"


def main(req, res):
    client = Client()

    # You can remove services you don't use
    account = Account(client)
    avatars = Avatars(client)
    database = Databases(client)
    functions = Functions(client)
    health = Health(client)
    locale = Locale(client)
    storage = Storage(client)
    teams = Teams(client)
    users = Users(client)

    if not req.variables.get("APPWRITE_FUNCTION_ENDPOINT") or not req.variables.get(
        "APPWRITE_FUNCTION_API_KEY"
    ):
        print("Environment variables are not set. Function cannot use Appwrite SDK.")
    else:
        (
            client.set_endpoint(req.variables.get("APPWRITE_FUNCTION_ENDPOINT", None))
            .set_project(req.variables.get("APPWRITE_FUNCTION_PROJECT_ID", None))
            .set_key(req.variables.get("APPWRITE_FUNCTION_API_KEY", None))
            .set_self_signed(True)
        )

    reddit = praw.Reddit(
        client_id=API_CLIENT,  # peronal use script
        client_secret=API_SECRET,  # secret token
        usernme=REDDIT_USERNAME,  # profile username
        password=REDDIT_PASSWORD,  # profile password
        user_agent="sheesh",
    )

    # payload dict: {subreddits: str[], 4chan: str[], limit: int, userId: str{todo}, fileType: str{todo}}
    # {
    #  "subreddits": ["anime", "memes"],
    #   "4chan": ["b", "g"],
    #   "limit": 10,
    # }
    subreddits = None
    chan4 = None
    try:
        payload = json.loads(req.payload)
        subreddits = payload["subreddits"]
        chan4 = payload["4chan"]

    except Exception as e:
        print(e)

    my_dict = {
        "reddit": {
            "subreddits": subreddits,
            "data": {
                "image": [],
                "video": [],
                "gif": [],
                "other": [],
            },
        },
        "4chan": {
            "boards": chan4,
            "data": {
                "image": [],
                "video": [],
                "gif": [],
                "other": [],
            },
        },
    }

    # Create thread objects for each function
    # for reddit
    thread1 = threading.Thread(
        target=redditBuilder(subreddits, my_dict, reddit, payload)
    )
    # for 4chan
    thread2 = threading.Thread(target=chan4Builder(chan4, my_dict, payload))

    # Start the threads
    thread1.start()
    thread2.start()

    # Wait for the threads to finish
    thread1.join()
    thread2.join()

    # Create the file contents by joining array elements with newlines
    file_contents = json.dumps(my_dict, indent=2)
    file = file_contents.encode("utf-8")
    # # Create a file object with the contents
    file_name = randomString() + ".json"
    result = storage.create_file(
        "647a1723a374f6845b7a", ID.unique(), InputFile.from_bytes(file, file_name)
    )
    url = "https://cloud.appwrite.io/v1/storage/buckets/{}/files/{}/view?project={}".format(
        result["bucketId"],
        result["$id"],
        req.variables.get("APPWRITE_FUNCTION_PROJECT_ID"),
    )

    # url example
    # https://cloud.appwrite.io/v1/storage/buckets/{647a1723a374f6 -> bucketId}/files/{647a1b7b31a -> fileId}/view?project={6463a34a73c& -> projectId}

    return res.json({"posts": "ok", "url": url})


def randomString(stringLength=10):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return "".join(random.choice(letters) for i in range(stringLength))


def redditBuilder(subreddits: list, my_dict: dict, reddit: praw.Reddit, payload: dict):
    for subreddit in subreddits:
        postsHot = reddit.subreddit(subreddit).hot(limit=payload["limit"])
        postsNew = reddit.subreddit(subreddit).new(limit=payload["limit"])
        postsRising = reddit.subreddit(subreddit).rising(limit=payload["limit"])
        postsControversial = reddit.subreddit(subreddit).controversial(
            limit=payload["limit"]
        )
        postsTop = reddit.subreddit(subreddit).top(limit=payload["limit"])
        pp = [postsHot, postsNew, postsRising, postsControversial, postsTop]

        for postT in pp:
            for post in postT:
                if re.search(r"\.(jpg|jpeg|png)$", post.url):
                    my_dict["reddit"]["data"]["image"].append(post.url)
                elif re.search(r"\.(gif)$", post.url):
                    my_dict["reddit"]["data"]["gif"].append(post.url)
                elif re.search(r"\.(mp4)$", post.url):
                    my_dict["reddit"]["data"]["video"].append(post.url)
                else:
                    my_dict["reddit"]["data"]["other"].append(post.url)


def chan4Builder(chan4: list, my_dict: dict, payload: dict):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
    }
    print(chan4)
    for board in chan4:
        response = requests.get(
            "https://a.4cdn.org/{}/catalog.json".format(board), headers=headers
        ).json()

        for page in response:
            for thread in page["threads"]:
                try:
                    if "tim" in thread or "ext" in thread:
                        if (
                            thread["ext"] == ".jpg"
                            or thread["ext"] == ".jpeg"
                            or thread["ext"] == ".png"
                            or thread["ext"] == ".webm"
                        ) and (
                            len(my_dict["4chan"]["data"]["image"]) < payload["limit"]
                        ):
                            my_dict["4chan"]["data"]["image"].append(
                                "https://i.4cdn.org/{}/{}{}".format(
                                    board, thread["tim"], thread["ext"]
                                )
                            )
                        elif thread["ext"] == ".mp4" and (
                            len(my_dict["4chan"]["data"]["video"]) < payload["limit"]
                        ):
                            my_dict["4chan"]["data"]["video"].append(
                                "https://i.4cdn.org/{}/{}{}".format(
                                    board, thread["tim"], thread["ext"]
                                )
                            )
                        elif thread["ext"] == ".gif" and (
                            len(my_dict["4chan"]["data"]["gif"]) < payload["limit"]
                        ):
                            my_dict["4chan"]["data"]["gif"].append(
                                "https://i.4cdn.org/{}/{}{}".format(
                                    board, thread["tim"], thread["ext"]
                                )
                            )
                    else:
                        print("no image")
                        if len(my_dict["4chan"]["data"]["text"]) < payload["limit"]:
                            my_dict["4chan"]["data"]["text"].append(thread["com"])

                    threadRes = requests.get(
                        "https://a.4cdn.org/{}/thread/{}.json".format(
                            board, thread["no"]
                        ),
                        headers=headers,
                    ).json()

                    # taking almost 2 minutes to run
                    # for post in threadRes["posts"]:
                    #     if "tim" in post or "ext" in post:
                    #         if (
                    #             post["ext"] == ".jpg"
                    #             or post["ext"] == ".jpeg"
                    #             or post["ext"] == ".png"
                    #             or post["ext"] == ".webm"
                    #         ) and (
                    #             len(my_dict["4chan"]["data"]["image"]) < payload["limit"]
                    #         ):
                    #             my_dict["4chan"]["data"]["image"].append(
                    #                 "https://i.4cdn.org/{}/{}{}".format(
                    #                     board, post["tim"], post["ext"]
                    #                 )
                    #             )
                    #             if (
                    #                 len(my_dict["4chan"]["data"]["image"])
                    #                 >= payload["limit"]
                    #             ):
                    #                 break
                    #         elif post["ext"] == ".mp4" and (
                    #             len(my_dict["4chan"]["data"]["video"]) < payload["limit"]
                    #         ):
                    #             my_dict["4chan"]["data"]["video"].append(
                    #                 "https://i.4cdn.org/{}/{}{}".format(
                    #                     board, post["tim"], post["ext"]
                    #                 )
                    #             )

                    #             if (
                    #                 len(my_dict["4chan"]["data"]["video"])
                    #                 >= payload["limit"]
                    #             ):
                    #                 break
                    #         elif post["ext"] == ".gif" and (
                    #             len(my_dict["4chan"]["data"]["gif"]) < payload["limit"]
                    #         ):
                    #             my_dict["4chan"]["data"]["gif"].append(
                    #                 "https://i.4cdn.org/{}/{}{}".format(
                    #                     board, post["tim"], post["ext"]
                    #                 )
                    #             )

                    #             if len(my_dict["4chan"]["data"]["gif"]) >= payload["limit"]:
                    #                 break

                    #     else:
                    #         if len(my_dict["4chan"]["data"]["text"]) >= payload["limit"]:
                    #             break
                    #         if len(my_dict["4chan"]["data"]["text"]) < payload["limit"]:
                    #             my_dict["4chan"]["data"]["text"].append(post["com"])
                except Exception as e:
                    print(e)
                    continue
