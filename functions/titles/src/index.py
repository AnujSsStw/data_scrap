from appwrite.client import Client

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

    
  API_CLIENT = "DIh7RjYEWFD7owiTja0OGQ"
  API_SECRET = "KG8WVc51LIojuSdYDfPZAQRc0EzErA"
  REDDIT_USERNAME = "AnujSsSs"
  REDDIT_PASSWORD = "6TY@6_Pu6h8-tmw"

  reddit = praw.Reddit(client_id=API_CLIENT,
                      client_secret=API_SECRET,
                      username=REDDIT_USERNAME,
                      password=REDDIT_PASSWORD,
                      user_agent="sheesh")
  
  query = None
  # payload dict: {q: str, limit: int}
  # { 
  # "q": "anime",
  # "limit": 10
  # }
  try:
      payload = json.loads(req.payload)
      query = payload['q']
      print(payload)
  except Exception as err:
      print(err)
      raise Exception('Payload is invalid.')
    
  subreddits = reddit.subreddits.search(query, limit=payload['limit'])

  sub_reddit = []
  for subreddit in subreddits:
      sub_reddit.append(subreddit.url)

  # 4chan
  headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
  }
  chan_4 = []

  try:
      response = requests.get(
          url="https://a.4cdn.org/boards.json", headers=headers).json()

      boards = response['boards']

      for board in boards:
          if board['title'] == query or query in board['meta_description']:
              chan_4.append(board['board'])

          for reddit in sub_reddit:
              if reddit in board['meta_description'] or reddit in board['title']:
                  chan_4.append(board['board'])

  except Exception as err:
      print(err)

  return res.json({
    "subreddits": sub_reddit,
    "4chan": chan_4
  })