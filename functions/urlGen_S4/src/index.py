import shutil
import os
import json


def main(req, res):
    changeThePackage()
    try:
        import snscrape.modules.twitter as twitter
        import snscrape as ss

        # {
        #     "query": "anime",
        #     "limit": 10,
        #     "fromL1": True | False,
        #     "dataType": "csv" | "json" | "raw",
        # }
        payload = json.loads(req.payload)
        print(payload)

        allT = twitter.TwitterSearchScraper(
            query=payload["query"],
            mode=ss.modules.twitter.TwitterSearchScraperMode.TOP,
        ).get_items()

        tweets = []
        if payload["fromL1"]:
            if payload["dataType"] == "json":
                for i, tweet in enumerate(allT):
                    if i > payload["limit"]:
                        break
                    tweets.append(
                        {
                            "content": tweet.rawContent,
                            "media": tweet.media[0] if tweet.media else None,
                            "likes": tweet.likeCount,
                        }
                    )
            elif payload["dataType"] == "raw":
                for i, tweet in enumerate(allT):
                    if i > payload["limit"]:
                        break
                    tweets.append(
                        tweet.media[0] if tweet.media else None,
                    )
                # tweets[0].fullUrl
        else:
            for i, tweet in enumerate(allT):
                if i > 9:
                    break
                tweets.append(
                    {
                        "content": tweet.rawContent,
                        "media": tweet.media[0] if tweet.media else None,
                        "likes": tweet.likeCount,
                    }
                )

        print(tweets)

    except Exception as e:
        print("error: ", e)

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
