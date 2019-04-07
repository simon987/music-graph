import csv
import json
from multiprocessing.pool import ThreadPool

from task_tracker_drone.src.tt_drone.api import TaskTrackerApi, Worker

TT_API_URL = "https://tt.simon987.net/api"
TT_PROJECT = 1

api = TaskTrackerApi(TT_API_URL)

worker = Worker.from_file(api)
if not worker:
    worker = api.make_worker("last.fm scraper")
    worker.dump_to_file()
    worker.request_access(TT_PROJECT, True, True)

    input("Give permission to " + worker.alias)

with open("repo/artist.csv") as f:
    reader = csv.reader(f)

    def mktask(line):
        res = worker.submit_task(
            project=TT_PROJECT,
            recipe=json.dumps({"mbid": line[0], "name": line[1]}),
            unique_str=line[0],
            max_assign_time=60 * 5,
        )
        print(res.text)

    def lines():
        for line in reader:
            if "Group" in line[2]:
                yield line

    pool = ThreadPool(processes=60)
    pool.map(func=mktask, iterable=lines())

