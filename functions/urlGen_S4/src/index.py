import shutil
import os
import json


def main(req, res):
    changeThePackage()
    try:
        import snscrape.modules.twitter as twitter
        import snscrape as ss

        {
            "query": "anime",
            "limit": 10,
        }
        payload = json.loads(req.payload)
        print(payload)

        tweets = []
        for i, tweet in enumerate(
            twitter.TwitterSearchScraper(
                query=f"#{payload['query']}",
                mode=ss.modules.twitter.TwitterSearchScraperMode.TOP,
            ).get_items()
        ):
            if i > payload["limit"]:
                break
            tweets.append([tweet.user.username, tweet.content, tweet.media])

        print(tweets)

    except Exception as e:
        print(e)

    return res.json({"service": "twitter", "urls": tweets})


def changeThePackage():
    try:
        new_dir = "/usr/local/src/userlib/src/snscrape"
        original_dir = (
            "/usr/local/src/userlib/runtime-env/lib/python3.9/site-packages/snscrape"
        )

        print(os.path.exists(original_dir))
        # Delete the existing destination directory if it exists
        if os.path.exists(original_dir):
            shutil.rmtree(original_dir)

        # # Replace the directory
        shutil.move(new_dir, original_dir)

    except Exception as e:
        print(e)
