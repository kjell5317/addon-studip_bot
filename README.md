# Docker StudIP Bot

## src/config

### config.json

1. Change the URLs
2. Change the names, ids and prefixes of your courses. The prefixes are RegEx to find all files in this course.
3. At `folders` you can set your Google Drive destination folder with its id.

### secrets.json

1. [Create Google OAuth-Credentials](https://developers.google.com/workspace/guides/create-credentials).
2. Create a file called `secrets.json` and add the following:

```json
{
  "stud_ip": {
    "name": "<YOUR_USERNAME>",
    "password": "<YOUR_PASSWORD>"
  },
  "google_drive": "insert the <installed object from your secrets file here>",
  "home_assistant": {
    "api_key": "<YOUR_API_KEY>"
  }
}
```

## Run Container

`docker-compose up -d`
