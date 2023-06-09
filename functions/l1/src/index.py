from appwrite.client import Client
import praw
import json
import time
import concurrent.futures
import multiprocessing

# You can remove imports of services you don't use
from appwrite.services.account import Account
from appwrite.services.storage import Storage
from appwrite.services.functions import Functions
from appwrite.services.users import Users
from appwrite.permission import Permission
from appwrite.role import Role

# old one
API_CLIENT = "DIh7RjYEWFD7owiTja0OGQ"
API_SECRET = "KG8WVc51LIojuSdYDfPZAQRc0EzErA"
REDDIT_USERNAME = "AnujSsSs"
REDDIT_PASSWORD = "6TY@6_Pu6h8-tmw"

bucketObj = None


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

    reddit = praw.Reddit(
        client_id=API_CLIENT,  # peronal use script
        client_secret=API_SECRET,  # secret token
        usernme=REDDIT_USERNAME,  # profile username
        password=REDDIT_PASSWORD,  # profile password
        user_agent="sheesh",
    )

    # actual payload
    # {
    #     "gen1": {"subreddits": ["wallpapers"], "limit": 10},
    #     "gen2": {"boards": ["g", "b", "pol"], "limit": 10},
    #     "gen3": {"pin": "wallpaper", "limit": 10},
    #     "gen4": {
    #         "query": "wallpaper",
    #         "limit": 10,
    #         "fromL1": True | False,
    #         "dataType": "csv" | "json" | "raw",
    #     },
    #     "q": "wallpaper",
    #     "dataType": "csv" | "json" | "raw
    # }

    actual_posts_url = None
    try:
        payload = json.loads(req.payload)
        print(payload)
        # create execution

        # Create a shared list using multiprocessing.Manager
        manager = multiprocessing.Manager()
        shared_list = manager.list()

        # Execute functions in parallel with multiple processes
        with concurrent.futures.ProcessPoolExecutor() as executor:
            # Submit function 1
            future1 = executor.submit(gen1, payload, functions, shared_list)

            # Submit function 2
            future2 = executor.submit(gen2, payload, functions, shared_list)

            # Submit function 2
            future3 = executor.submit(gen3, payload, functions, shared_list)

            # Submit function 2
            future4 = executor.submit(gen4, payload, functions, shared_list)

            # Wait for both futures to complete
            concurrent.futures.wait([future1, future2, future3, future4])

        # Convert the shared list to a regular list for further processing
        actual_posts_url = list(shared_list)

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
        bucket_Id = None
        if len(payload["gen1"]["subreddits"]) > 0:
            bucket_Id = payload["gen1"]["subreddits"][0]
        else:
            bucket_Id = payload["q"]

        global bucketObj
        bucketObj = bucketCheck(bucket_Id)

        batches = [
            data_array[i : i + batch_size]
            for i in range(0, len(data_array), batch_size)
        ]
        for batch in batches:
            batch = json.dumps(
                {
                    "urls": {"image": batch},
                    "bucketId": bucket_Id,
                }
            )
            send_data_batch(batch)
            # make sleep for 3 sec
            # time.sleep(3)

    def bucketCheck(bucket_Id):
        result = None
        try:
            result = storage.get_bucket(bucket_id=bucket_Id)
            print("bucket found", result)
        except Exception as e:
            print("bucket not found", e)
            # create bucket
            result = storage.create_bucket(
                bucket_id=bucket_Id,
                name=bucket_Id,
                file_security=None,
                permissions=[
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users()),
                ],
                enabled=True,
                # maximum_file_size=1000000,
                # allowed_file_extensions=[],
                # compression="none",
                # encryption=False,
                # antivirus=False,
            )
            print("bucket created", result)

        return result

    if payload["dataType"] == "raw":
        send_data_in_batches(actual_posts_url, 10)
        preview_data = []
        for i, url in enumerate(actual_posts_url):
            if i > 10:
                break
            preview_data.append(url)

        print("preview data", preview_data)
        # only for raw data
        try:
            print("bucket obj: ", bucketObj)
            ddData = json.dumps(
                {
                    "bucketId": bucketObj["$id"],
                    "TotalCount": len(actual_posts_url),
                    "topic": payload["q"],
                    "dataType": "raw",
                }
            )
            print("ddData", ddData)

            functions.create_execution(
                function_id="6485b0c7c8e8feddb2f7", data=ddData, xasync=True
            )
        except Exception as e:
            print("error while send data to docStuff", e)

        return res.json(
            {
                "preview data": preview_data,
            }
        )

    else:
        return res.json(
            {
                "dataType": payload["dataType"],
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


# whatever reddit that offer currently -> images, gifs, videos, other(text, link)
def gen1(payload: dict, functions: Functions, shared_list: list):
    if len(payload["gen1"]["subreddits"]) > 0:
        try:
            urlGen1R = functions.create_execution(
                "647f888eeaa470f6a362", json.dumps(payload["gen1"])
            )
            if urlGen1R["status"] == "completed":
                shared_list.extend(json.loads(urlGen1R["response"])["urls"]["image"])
        except Exception as e:
            print("error while gen1", e)


# images from 4chan and weird stuff
def gen2(payload: dict, functions: Functions, shared_list: list):
    if len(payload["gen2"]["boards"]) > 0:
        urlGen2C = functions.create_execution(
            "647f889c6c907ff58c57", json.dumps(payload["gen2"])
        )
        if urlGen2C["status"] == "completed":
            shared_list.extend(json.loads(urlGen2C["response"])["urls"]["image"])


# all about images
def gen3(payload: dict, functions: Functions, shared_list: list):
    if len(payload["gen3"]["pin"]) > 0:
        urlGen3P = functions.create_execution(
            "6482166f1f68d02a3570", json.dumps(payload["gen3"])
        )
        if urlGen3P["status"] == "completed":
            shared_list.extend(json.loads(urlGen3P["response"])["urls"])


# about raw content of twitter and img, video, gif
def gen4(payload: dict, functions: Functions, shared_list: list):
    if len(payload["gen4"]["query"]) > 0:
        urlGen4T = functions.create_execution(
            "64821f7fee991ae03baf", json.dumps(payload["gen4"])
        )
        if urlGen4T["status"] == "completed":
            shared_list.extend(json.loads(urlGen4T["response"])["urls"])
