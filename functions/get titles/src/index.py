import praw
import json

API_CLIENT = "DIh7RjYEWFD7owiTja0OGQ"
API_SECRET = "KG8WVc51LIojuSdYDfPZAQRc0EzErA"
REDDIT_USERNAME = "AnujSsSs"
REDDIT_PASSWORD = "6TY@6_Pu6h8-tmw"


def main(req, res):
    reddit = praw.Reddit(client_id=API_CLIENT,  # peronal use script
                         client_secret=API_SECRET,  # secret token
                         usernme=REDDIT_USERNAME,  # profile username
                         password=REDDIT_PASSWORD,  # profile password
                         user_agent="sheesh")

    file_url = None
    # payload dict: {q: str, limit: int}
    try:
        payload = json.loads(req.payload)
        file_url = payload['q']
        print(file_url)
    except Exception as err:
        print(err)
        raise Exception('Payload is invalid.')

    subreddits = reddit.subreddits.search(file_url, limit=payload['limit'])

    reddit_url = []
    for subreddit in subreddits:
        reddit_url.append(subreddit.url)

    return res.json({
        "subreddits": reddit_url,
    })

