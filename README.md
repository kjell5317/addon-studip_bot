# Docker StudIP Bot

## Configuration

Copy the studip folder from the [repository](https://github.com/kjell5317/addon-studip_bot) to your Home Assistant config directory.

### config.json

1. Change the URLs and the download directory
2. Change the names, ids and prefixes of your courses. The prefixes are RegExs to find all files in this course that are relevant for you.
3. At `folders` you can set your Google Drive destination folder with it's ID.

### secrets.json

1. [Create Google OAuth-Credentials](https://developers.google.com/workspace/guides/create-credentials).
2. Authenticate and copy the empty values into `secrets.json` and the returned `token.json`.
3. Add your StudIP credentials.
