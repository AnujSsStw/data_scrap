from appwrite.client import Client

# You can remove imports of services you don't use
from appwrite.services.account import Account
from appwrite.services.databases import Databases
from appwrite.services.functions import Functions
from appwrite.services.storage import Storage
from appwrite.services.users import Users

import praw
import json
import requests

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


def main(req, res):
    client = Client()

    # You can remove services you don't use
    account = Account(client)
    storage = Storage(client)
    functions = Functions(client)
    users = Users(client)

    client.set_endpoint("https://cloud.appwrite.io/v1").set_project(
        "648841eb86516a2bef68"
    ).set_key(
        "d39df74199ec12be4496e1bce1c7df4a073b92e8ee2a1f58553a54af859a732759a48697e855304dc69b2882376161ca4ecbfd6350a122a92b1988ccff9ebced3f9772c9cb46f7624b7132bde505623804b83c99bf100e5543dd4e81f19af377f3765beaf528006c09b2285fe8166346757e080d1a073574cae96832e80c518e"
    ).set_self_signed(
        True
    )

    API_CLIENT = "DIh7RjYEWFD7owiTja0OGQ"
    API_SECRET = "KG8WVc51LIojuSdYDfPZAQRc0EzErA"
    REDDIT_USERNAME = "AnujSsSs"
    REDDIT_PASSWORD = "6TY@6_Pu6h8-tmw"

    reddit = praw.Reddit(
        client_id=API_CLIENT,
        client_secret=API_SECRET,
        username=REDDIT_USERNAME,
        password=REDDIT_PASSWORD,
        user_agent="sheesh",
    )

    query = None
    # payload dict: {q: str, limit: int}
    # {"q": "anime", "limit": 10}
    try:
        payload = json.loads(req.payload)
        query = payload["q"]
        print(payload)
    except Exception as err:
        print(err)
        raise Exception("Payload is invalid.")

    subreddits = reddit.subreddits.search(query, limit=payload["limit"])

    sub_reddit = []
    for subreddit in subreddits:
        sub_reddit.append(
            {"subreddit": subreddit.url, "description": subreddit.public_description}
        )

    # 4chan
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
    }
    chan_4 = []

    try:
        response = requests.get(
            url="https://a.4cdn.org/boards.json", headers=headers
        ).json()

        boards = response["boards"]

        for board in boards:
            if board["title"] == query or query in board["meta_description"]:
                chan_4.append({"board": board["board"], "title": board["title"]})

            for my_dict in sub_reddit:
                for value in my_dict.values():
                    if board["meta_description"] in value or board["title"] in value:
                        chan_4.append(
                            {"board": board["board"], "title": board["title"]}
                        )

    except Exception as err:
        print(err)

    # for pinterest
    pinterest = []
    try:
        pinterest.append(f"https://www.pinterest.com/search/pins/?q={query}")
    except Exception as e:
        print("for pinterest: ", e)

    # for twitter
    try:
        p = {"query": query, "limit": 10, "fromL1": False}
        urlGen_S4 = functions.create_execution("64821f7fee991ae03baf", json.dumps(p))
        if urlGen_S4["status"] == "completed":
            twitter = json.loads(urlGen_S4["response"])["urls"]
    except Exception as e:
        print("twitter exc: ", e)

    return res.json(
        {
            "subreddits": sub_reddit,
            "chan_4": chan_4,
            "pinterest": pinterest,
            "twitter": twitter,
        }
    )
