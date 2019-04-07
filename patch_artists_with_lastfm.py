import csv
import json
import sqlite3
import sys


def patch(lastfm_data):
    with sqlite3.connect(lastfm_data) as conn:
        cur = conn.cursor()

        cur.execute("SELECT data FROM lastfmdata", )
        data = cur.fetchall()

    if data:

        buffer = []
        dup_buf = set()
        artist_listeners = dict()
        artists = set()

        for row in data:
            lastfm_data = json.loads(row[0])

            for similar in [s for s in lastfm_data["similar"] if s["mbid"] is not None]:
                if (similar["mbid"], lastfm_data["artist"]) not in dup_buf:
                    buffer.append((
                        similar["mbid"],
                        lastfm_data["artist"],
                        similar["match"]
                    ))
                    dup_buf.add((similar["mbid"], lastfm_data["artist"]))
                    dup_buf.add((lastfm_data["artist"], similar["mbid"]))

            artist_listeners[lastfm_data["artist"]] = (lastfm_data["listeners"], lastfm_data["playcount"])

        del dup_buf

        with open("repo/lastfm_artist.csv", "w") as out:

            writer = csv.writer(out)
            writer.writerow([
                "id:ID(Artist)", "name", ":LABEL", "listeners:int", "playcount:int"
            ])

            with open("repo/artist.csv") as f:
                reader = csv.reader(f)

                reader.__next__()  # Skip header
                for row in reader:
                    writer.writerow([
                        row[0],
                        row[1],
                        row[2],
                        row[3],
                        artist_listeners.get(row[0], (0, 0))[0],
                        artist_listeners.get(row[0], (0, 0))[1],
                    ])
                    artists.add(row[0])

        with open("repo/lastfm_artist_artist.csv", "w") as out:
            out.write(",".join((
                ":START_ID(Artist)", ":END_ID(Artist)", "weight"
            )) + "\n")

            for x in buffer:
                if x[0] not in artists:
                    continue
                if x[1] not in artists:
                    continue

                out.write(",".join(x) + "\n")


patch(sys.argv[1])
