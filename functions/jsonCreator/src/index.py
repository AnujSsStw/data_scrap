from appwrite.client import Client
import concurrent.futures
import multiprocessing
import json
import random
import string

# You can remove imports of services you don't use
from appwrite.services.account import Account
from appwrite.services.avatars import Avatars
from appwrite.services.databases import Databases
from appwrite.services.functions import Functions
from appwrite.services.health import Health
from appwrite.role import Role
from appwrite.services.storage import Storage
from appwrite.permission import Permission
from appwrite.id import ID
from appwrite.input_file import InputFile

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
    avatars = Avatars(client)
    database = Databases(client)
    functions = Functions(client)
    health = Health(client)
    storage = Storage(client)

    client.set_endpoint("https://cloud.appwrite.io/v1").set_project(
        "6463a34a73ca03c70d35"
    ).set_key(
        "8e2d4eb0b3a64642fcaa0163302bf185053e28fa015c6c2b654e0f313afa07abd709347fcfbac4584c16bfe00df5760daa3f728ed10f6f042fc900fc41283a2601758c446d5673b987b686ccf951deba9e463d9bfff06a3f9f6e722634b984005f0c5898eb9848c63f16d77ca1d56c2d4dbae51abe6000ea35d16d474d66e64f"
    ).set_self_signed(
        True
    )

    actual_dict = None
    payload = None
    try:
        # {
        #     "gen1": {"subreddits": ["wallpapers"], "limit": 10},
        #     "gen2": {"boards": ["g", "b", "pol"], "limit": 10},
        #     "gen3": {"pin": "wallpaper", "limit": 10},
        #     "gen4": {
        #         "query": "wallpaper",
        #         "limit": 10,
        #         "fromL1": True,
        #         "dataType": "json",
        #     },
        # }
        payload = json.loads(req.payload)

        # Create a shared list using multiprocessing.Manager
        manager = multiprocessing.Manager()
        shared_dict = manager.dict()

        # Execute functions in parallel with multiple processes
        with concurrent.futures.ProcessPoolExecutor() as executor:
            # Submit function 1
            future1 = executor.submit(gen1, payload, functions, shared_dict)

            # Submit function 2
            future2 = executor.submit(gen2, payload, functions, shared_dict)

            # Submit function 2
            future3 = executor.submit(gen3, payload, functions, shared_dict)

            # Submit function 2
            future4 = executor.submit(gen4, payload, functions, shared_dict)

            # Wait for both futures to complete
            concurrent.futures.wait([future1, future2, future3, future4])

        # Convert the shared list to a regular list for further processing
        actual_dict = dict(shared_dict)

        # Create the file contents by joining array elements with newlines
        file_contents = json.dumps(actual_dict, indent=4)
        file = file_contents.encode("utf-8")
        # # Create a file object with the contents
        file_name = randomString() + ".json"

        result = storage.create_file(
            "647a1723a374f6845b7a",
            ID.unique(),
            InputFile.from_bytes(file, file_name),
            [Permission.read(role=Role.any())],
        )

        url = "https://cloud.appwrite.io/v1/storage/buckets/{}/files/{}/view?project=6463a34a73ca03c70d35".format(
            result["bucketId"],
            result["$id"],
        )

        docStuffData = {"bucketUrl": url, "topic": payload["q"], "dataType": "json"}
        functions.create_execution(
            function_id="6485b0c7c8e8feddb2f7",
            data=json.dumps(docStuffData),
            xasync=True,
        )
    except Exception as e:
        print("problem with payload", e)

    return res.json(
        {
            "status": "success",
            "link": url,
        }
    )


# whatever reddit that offer currently -> images, gifs, videos, other(text, link)
def gen1(payload: dict, functions: Functions, shared_dict: dict):
    if len(payload["gen1"]["subreddits"]) > 0:
        urlGen1R = functions.create_execution(
            "647f888eeaa470f6a362", json.dumps(payload["gen1"])
        )
        if urlGen1R["status"] == "completed":
            shared_dict["reddit"] = json.loads(urlGen1R["response"])["urls"]


# images from 4chan and weird stuff
def gen2(payload: dict, functions: Functions, shared_dict: dict):
    if len(payload["gen2"]["boards"]) > 0:
        urlGen2C = functions.create_execution(
            "647f889c6c907ff58c57", json.dumps(payload["gen2"])
        )
        if urlGen2C["status"] == "completed":
            shared_dict["chan4"] = json.loads(urlGen2C["response"])["urls"]


# all about images
def gen3(payload: dict, functions: Functions, shared_dict: dict):
    if len(payload["gen3"]["pin"]) > 0:
        urlGen3P = functions.create_execution(
            "6482166f1f68d02a3570", json.dumps(payload["gen3"])
        )
        if urlGen3P["status"] == "completed":
            shared_dict["pin"] = json.loads(urlGen3P["response"])["urls"]


# about raw content of twitter and img, video, gif
def gen4(payload: dict, functions: Functions, shared_dict: dict):
    if len(payload["gen4"]["query"]) > 0:
        urlGen4T = functions.create_execution(
            "64821f7fee991ae03baf", json.dumps(payload["gen4"])
        )
        if urlGen4T["status"] == "completed":
            shared_dict["twitter"] = json.loads(urlGen4T["response"])["urls"]


def randomString(stringLength=10):
    letters = string.ascii_lowercase
    return "".join(random.choice(letters) for i in range(stringLength))
