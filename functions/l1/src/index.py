from appwrite.client import Client
import praw
import json

# You can remove imports of services you don't use
from appwrite.services.account import Account
from appwrite.services.databases import Databases
from appwrite.services.functions import Functions
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
    database = Databases(client)
    functions = Functions(client)
    users = Users(client)

    client.set_endpoint("https://cloud.appwrite.io/v1").set_project(
        "6463a34a73ca03c70d35"
    ).set_key(
        "8e2d4eb0b3a64642fcaa0163302bf185053e28fa015c6c2b654e0f313afa07abd709347fcfbac4584c16bfe00df5760daa3f728ed10f6f042fc900fc41283a2601758c446d5673b987b686ccf951deba9e463d9bfff06a3f9f6e722634b984005f0c5898eb9848c63f16d77ca1d56c2d4dbae51abe6000ea35d16d474d66e64f"
    ).set_self_signed(
        True
    )

    reddit = praw.Reddit(
        client_id=API_CLIENT,  # peronal use script
        client_secret=API_SECRET,  # secret token
        usernme=REDDIT_USERNAME,  # profile username
        password=REDDIT_PASSWORD,  # profile password
        user_agent="sheesh",
    )

    # payload type
    #     my_dict = {
    #     "reddit": {
    #       "subreddits": subreddits,
    #       "data": {
    #         "image": [],
    #         "video": [],
    #         "gif": [],
    #         "other": [],
    #       },
    #     },
    #     "4chan": {
    #       "boards": chan4,
    #       "data": {
    #         "image": [],
    #         "video": [],
    #         "gif": [],
    #         "other": [],
    #       },
    #     },
    #   }

    actual_posts_url = []
    subreddits = None
    try:
        payload = json.loads(req.payload)
        subreddits = payload["reddit"]["data"]["other"]

        # extrat the url from payload
        url1 = payload["reddit"]["data"]["image"]
        url2 = payload["4chan"]["data"]["image"]
        actual_posts_url.append(url1)
        actual_posts_url.append(url2)

        for other in subreddits:
            if "gallery" in other:
                print("gallery")
                submission = reddit.submission(url=other)
                for image in submission.gallery_data["items"]:
                    if image["media_id"] == None:
                        continue

                    media_url = f"https://i.redd.it/{image['media_id']}.jpg"
                    actual_posts_url.append(media_url)

        print(actual_posts_url)
    except Exception as e:
        print("error", e)

    # now send the actual_posts_url to the l2 function for downlaoding and uploading to appwrite storage
    # send the url in batches of 10 to l2 function concurrently

    def send_data_batch(data):
        try:
            functions.create_execution(
                function_id="647c27fe0d76730d30d2", data=data, xasync=True
            )
        except Exception as e:
            print("error", e)

    def send_data_in_batches(data_array, batch_size):
        batches = [
            data_array[i : i + batch_size]
            for i in range(0, len(data_array), batch_size)
        ]
        for batch in batches:
            batch = json.dumps(batch)
            send_data_batch(batch)

    send_data_in_batches(actual_posts_url, 10)

    return res.json(
        {
            "areDevelopersAwesome": True,
        }
    )
