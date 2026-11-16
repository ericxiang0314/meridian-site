# Meridian

The night desk on the Mac belongs to this site. The site is the book: airports, airlines, airframes, and the few fields where a person can stand in public and watch an arrival.

The repository was initialized on GitHub before the pages were built: [ericxiang0314/meridian-site](https://github.com/ericxiang0314/meridian-site).

## Run

```bash
npm install
npm run dev
```

`npm install` builds `data/meridian.db` from the JSON in `data/source`. The pages read that database. Search lives at `/book`.

```bash
npm run check
npm run typecheck
npm run build
```

## The book

| Table | What it holds |
| --- | --- |
| airports | IATA, name, city, time zone, position |
| airlines | IATA, ICAO, name, the same designators the desk uses |
| types | ICAO type code and the airframe name |
| fields | Fourteen public spotting notes |

The source rows are public designators already kept beside the Mac app. Field notes are short and name only public places.
