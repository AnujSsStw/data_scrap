from appwrite.client import Client
import praw
import json
import random
import string

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

  if not req.variables.get('APPWRITE_FUNCTION_ENDPOINT') or not req.variables.get('APPWRITE_FUNCTION_API_KEY'):
    print('Environment variables are not set. Function cannot use Appwrite SDK.')
  else:
    (
    client
      .set_endpoint(req.variables.get('APPWRITE_FUNCTION_ENDPOINT', None))
      .set_project(req.variables.get('APPWRITE_FUNCTION_PROJECT_ID', None))
      .set_key(req.variables.get('APPWRITE_FUNCTION_API_KEY', None))
      .set_self_signed(True)
    )

  reddit = praw.Reddit(
    client_id=API_CLIENT,  # peronal use script
    client_secret=API_SECRET,  # secret token
    usernme=REDDIT_USERNAME,  # profile username
    password=REDDIT_PASSWORD,  # profile password
    user_agent="sheesh",
  )

  # payload dict: {subreddits: str[], limit: int, userId: str{todo}, fileType: str{todo}}

  actual_posts_url = []
  subreddits = None
  try:
    payload = json.loads(req.payload)
    subreddits = payload['subreddits']
    # limit = payload['limit']

    print(subreddits)

    for subreddit in subreddits:
      posts = reddit.subreddit(subreddit).hot(limit=payload['limit'])
      for post in posts:
        actual_posts_url.append(post.url)

    print(actual_posts_url)
    
   # Create the file contents by joining array elements with newlines
    file_contents = '\n'.join(actual_posts_url)
    file = file_contents.encode('utf-8')

    # # Create a file object with the contents
    file_name = randomString() + '.txt'
    result = storage.create_file('647a1723a374f6845b7a', ID.unique(), InputFile.from_bytes(file, file_name))

    url = "https://cloud.appwrite.io/v1/storage/buckets/{}/files/{}/view?project={}".format(result['bucketId'], result["$id"], req.variables.get('APPWRITE_FUNCTION_PROJECT_ID'))
  except Exception as e:
    print(e)


  #url example
  # https://cloud.appwrite.io/v1/storage/buckets/{647a1723a374f6 -> bucketId}/files/{647a1b7b31a -> fileId}/view?project={6463a34a73c& -> projectId}
  
  return res.json({
    "posts": "ok",
    "url": url
  })

def randomString(stringLength=10):
    """Generate a random string of fixed length """
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(stringLength))
