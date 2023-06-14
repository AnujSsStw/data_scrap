from appwrite.client import Client
import praw
import json
import re

API_CLIENT = "DIh7RjYEWFD7owiTja0OGQ"
API_SECRET = "KG8WVc51LIojuSdYDfPZAQRc0EzErA"
REDDIT_USERNAME = "AnujSsSs"
REDDIT_PASSWORD = "6TY@6_Pu6h8-tmw"


def main(req, res):
    reddit = praw.Reddit(
        client_id=API_CLIENT,  # peronal use script
        client_secret=API_SECRET,  # secret token
        usernme=REDDIT_USERNAME,  # profile username
        password=REDDIT_PASSWORD,  # profile password
        user_agent="sheesh",
    )
    # {
    #  "subreddits": ["wallpapers"],
    #   "limit": 10,
    # }
    subreddits = None
    payload = json.loads(req.payload)
    subreddits = payload["subreddits"]

    data = redditBuilder(subreddits, reddit, payload["limit"])

    return res.json({"service": "reddit", "urls": data})


def redditBuilder(subreddits: list, reddit: praw.Reddit, limit: int):
    my_dict = {
        "image": [],
        "gif": [],
        "video": [],
        "other": [],
        "count": 0,
    }

    for subreddit in subreddits:
        # if the limit is high then add other postType
        try:
            postsHot = reddit.subreddit(subreddit).hot(limit=limit)

            postsNew, postsControversial, postsRising, postsTop = None, None, None, None

            if limit > 1000:
                postsNew = reddit.subreddit(subreddit).new(limit=limit)
            if limit > 2000:
                postsRising = reddit.subreddit(subreddit).rising(limit=limit)
            if limit > 3000:
                postsControversial = reddit.subreddit(subreddit).controversial(
                    limit=limit
                )
            if limit > 5000:
                postsTop = reddit.subreddit(subreddit).top(limit=limit)

            # Check if the variables are None and reassign empty lists if necessary
            if postsNew is None:
                postsNew = []
            if postsControversial is None:
                postsControversial = []
            if postsRising is None:
                postsRising = []
            if postsTop is None:
                postsTop = []

            pp = [postsHot, postsTop, postsNew, postsRising, postsControversial]

            for postT in pp:
                if len(my_dict["image"]) >= limit:
                    break

                for post in postT:
                    if len(my_dict["image"]) >= limit:
                        break

                    if re.search(r"\.(jpg|jpeg|png)$", post.url):
                        my_dict["image"].append(post.url)
                        my_dict["count"] += 1
                    elif re.search(r"\.(gif)$", post.url):
                        my_dict["gif"].append(post.url)
                        my_dict["count"] += 1
                    elif re.search(r"\.(mp4)$", post.url):
                        my_dict["video"].append(post.url)
                        my_dict["count"] += 1
                    else:
                        my_dict["other"].append(post.url)
                        my_dict["count"] += 1
        except Exception as e:
            print("some subreddits are invalid", e)

    return my_dict
