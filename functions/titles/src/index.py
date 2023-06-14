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

    if not req.variables.get("APPWRITE_FUNCTION_ENDPOINT") or not req.variables.get(
        "APPWRITE_FUNCTION_API_KEY"
    ):
        print("Environment variables are not set. Function cannot use Appwrite SDK.")
    else:
        print("Environment variables are set. Function can use Appwrite SDK. yo yo yo")
        (
            client.set_endpoint(req.variables.get("APPWRITE_FUNCTION_ENDPOINT", None))
            .set_project(req.variables.get("APPWRITE_FUNCTION_PROJECT_ID", None))
            .set_key(req.variables.get("APPWRITE_FUNCTION_API_KEY", None))
            .set_self_signed(True)
        )

    API_CLIENT = req.variables.get("API_CLIENT", None)
    API_SECRET = req.variables.get("API_SECRET", None)
    REDDIT_USERNAME = req.variables.get("REDDIT_USERNAME", None)
    REDDIT_PASSWORD = req.variables.get("REDDIT_PASSWORD", None)
    USER_AGENT = req.variables.get("USER_AGENT", None)

    reddit = praw.Reddit(
        client_id=API_CLIENT,
        client_secret=API_SECRET,
        username=REDDIT_USERNAME,
        password=REDDIT_PASSWORD,
        user_agent=USER_AGENT,
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
