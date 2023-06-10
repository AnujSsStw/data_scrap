from appwrite.client import Client
import praw
import json
import time
import concurrent.futures
import threading

# You can remove imports of services you don't use
from appwrite.services.account import Account
from appwrite.services.storage import Storage
from appwrite.services.functions import Functions
from appwrite.services.users import Users
from appwrite.permission import Permission
from appwrite.role import Role

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

# Global list
actual_posts_url = []
lock = threading.Lock()


def main(req, res):
    client = Client()

    # You can remove services you don't use
    account = Account(client)
    storage = Storage(client)
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

    # actual payload
    {
        "gen1": {"subreddits": ["wallpapers"], "limit": 10},
        "gen2": {"boards": ["g", "b", "pol"], "limit": 10},
        "gen3": {"pin": "wallpaper"},
        "gen4": {"query": "wallpaper", "limit": 10, "fromL1": True | False},
    }

    try:
        payload = json.loads(req.payload)
        print(payload)
        # create execution

        # Execute functions in parallel
        with concurrent.futures.ThreadPoolExecutor() as executor:
            # Submit function 1
            future1 = executor.submit(gen1, payload, functions)

            # Submit function 2
            future2 = executor.submit(gen2, payload, functions)

            # Submit function 2
            future3 = executor.submit(gen3, payload, functions)

            # Submit function 2
            future4 = executor.submit(gen4, payload, functions)

            # Wait for both futures to complete
            concurrent.futures.wait([future1, future2, future3, future4])

    except Exception as e:
        print("error while payload or gen execution", e)

    def send_data_batch(data):
        try:
            functions.create_execution(
                function_id="647c27fe0d76730d30d2", data=data, xasync=True
            )
        except Exception as e:
            print("error while send data to l2", e)

    def send_data_in_batches(data_array, batch_size):
        # check if the bucket exists
        try:
            result = storage.get_bucket(payload["gen1"]["subreddits"][0])
            print("bucket found", result)
        except Exception as e:
            print("bucket not found", e)
            # create bucket
            result = storage.create_bucket(
                payload["gen1"]["subreddits"][0],
                payload["gen1"]["subreddits"][0],
                [
                    Permission.create(Role.any()),
                    Permission.read(Role.any()),
                    Permission.write(Role.any()),
                ],
                None,
                True,
            )
            print("bucket created", result)

        batches = [
            data_array[i : i + batch_size]
            for i in range(0, len(data_array), batch_size)
        ]
        for batch in batches:
            batch = json.dumps(
                {"urls": {"image": batch}, "bucketId": payload["gen1"]["subreddits"][0]}
            )
            send_data_batch(batch)
            # make sleep for 3 sec
            time.sleep(3)

    send_data_in_batches(actual_posts_url, 10)

    preview_data = []
    for i, url in enumerate(actual_posts_url):
        if i > 10:
            break
        preview_data.append(url)

    return res.json(
        {
            "preview data": preview_data,
        }
    )


def checkingForGallery(subreddits: list, actual_posts_url: list, reddit: praw.Reddit):
    for other in subreddits:
        if "gallery" in other:
            print("gallery")
            submission = reddit.submission(url=other)
            for image in submission.gallery_data["items"]:
                if image["media_id"] == None:
                    continue
                media_url = f"https://i.redd.it/{image['media_id']}.jpg"
                actual_posts_url.append(media_url)


def gen1(payload: dict, functions: Functions):
    if len(payload["gen1"]["subreddits"]) > 0:
        urlGen1R = functions.create_execution(
            "647f888eeaa470f6a362", json.dumps(payload["gen1"])
        )
        if urlGen1R["status"] == "completed":
            with lock:
                actual_posts_url.extend(
                    json.loads(urlGen1R["response"])["urls"]["image"]
                )


def gen2(payload: dict, functions: Functions):
    if len(payload["gen2"]["boards"]) > 0:
        urlGen2C = functions.create_execution(
            "647f889c6c907ff58c57", json.dumps(payload["gen2"])
        )
        if urlGen2C["status"] == "completed":
            with lock:
                actual_posts_url.extend(
                    json.loads(urlGen2C["response"])["urls"]["image"]
                )


def gen3(payload: dict, functions: Functions):
    if len(payload["gen3"]["pin"]) > 0:
        urlGen3P = functions.create_execution(
            "6482166f1f68d02a3570", json.dumps(payload["gen3"])
        )
        if urlGen3P["status"] == "completed":
            with lock:
                actual_posts_url.extend(json.loads(urlGen3P["response"])["urls"])


def gen4(payload: dict, functions: Functions):
    if len(payload["gen4"]["query"]) > 0:
        urlGen4T = functions.create_execution(
            "64821f7fee991ae03baf", json.dumps(payload["gen4"])
        )
        if urlGen4T["status"] == "completed":
            with lock:
                actual_posts_url.extend(json.loads(urlGen4T["response"])["urls"])
