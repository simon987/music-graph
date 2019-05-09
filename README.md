# music-graph

[![CodeFactor](https://www.codefactor.io/repository/github/simon987/music-graph/badge)](https://www.codefactor.io/repository/github/simon987/music-graph)
[![Build Status](https://ci.simon987.net/buildStatus/icon?job=music_graph)](https://ci.simon987.net/job/music_graph/)


wip

### Data import from MusicBrainz & Last.fm

```bash
# Download latest database dump
./get_musicbrainz_dump.sh

# Convert to .csv
python convert_mb.py

# Generate scraping tasks for task_tracker_drone (See notes)
python generate_scrape_tasks.py

# Apply last.fm data to artist.csv
python patch_artists_with_lastfm.py "/path/to/lasfm_data.db"

# Expose generated .csv data to the network
cd repo/
python -m http.server 9999

# On the machine where neo4j is installed:
./import.sh
```

### task_tracker setup:

Last.fm api calls are queued to [task_tracker](https://github.com/simon987/task_tracker/),
 and results are gathered by a [task_tracker_drone](https://github.com/simon987/task_tracker_drone/) 
 ([script](https://git.simon987.net/drone/last.fm/src/master/run)).


Project secret:
```json
{
	"apikey": "<Your Last.fm api key>",
	"user": "<Your Last.fm username>"
}
```

### Api setup

See [music-graph-api](https://github.com/simon987/music-graph-api) for setup instructions.

