const fs = require("fs");
const fetch = require("node-fetch");
const readline = require("readline");
const { google } = require("googleapis");
const secrets = require("./config/secrets.json");
const config = require("./config/config.json");
const downloadPrefix = config.download_folder;

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/drive"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
TOKEN_PATH = "config/token.json";

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param name The name of the file
 * @param mime The mime_type of the file
 */
async function authorize(name, mime) {
  const { client_secret, client_id, redirect_uris } = secrets.google_drive;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, name, mime);
    oAuth2Client.setCredentials(JSON.parse(token));
    uploadFiles(oAuth2Client, name, mime);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
async function getAccessToken(oAuth2Client, name, mime) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      uploadFiles(oAuth2Client, name, mime);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function uploadFiles(auth, name, mime) {
  const drive = google.drive({ version: "v3", auth });
  var parent = "1aDoDlVRr3c9dvLUaAV2lXC5AEgNeAPRd";
  for (array of config.folders) {
    for (folder of array) {
      const regex = new RegExp(folder.prefix);
      if (regex.test(name)) {
        parent = folder.dest;
        break;
      }
    }
  }
  var fileMetadata = {
    name: name,
    parents: [parent],
  };
  var media = {
    mimeType: mime,
    body: fs.createReadStream(`${downloadPrefix}${name}`),
  };
  drive.files.create(
    {
      resource: fileMetadata,
      media: media,
      fields: "id",
    },
    function (err) {
      if (err) {
        // Handle error
        console.error(err);
      }
    }
  );
  let res = await fetch(`${config.haURL}services/notify/mobile_app_k_handy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secrets.home_assistant.api_key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "StudIP",
      message: `Neu: ${name}`,
      data: {
        clickAction: `https://drive.google.com/drive/u/0/folders/${parent}`,
      },
    }),
  });
  if (!res.ok) {
    console.log("ERROR");
  }
}

// function update() {
//   const { client_secret, client_id, redirect_uris } = secrets.google_drive;
//   const oAuth2Client = new google.auth.OAuth2(
//     client_id,
//     client_secret,
//     redirect_uris[0]
//   );
//   // Check if we have previously stored a token.
//   fs.readFile(TOKEN_PATH, (err, token) => {
//     if (err) return console.log("Error", err);
//     oAuth2Client.setCredentials(JSON.parse(token));
//   });

//   const drive = google.drive({ version: "v3", oAuth2Client });
//   var pageToken = null;
//   console.log("call");
//   drive.files.list(
//     {
//       q: "(name contains ds-2021-ha) and (11Ck_fIsCxWySDh1C1ZD53GMwPaW-tqCC in parents)",
//       fields: "nextPageToken, files(id, name)",
//       spaces: "drive",
//       pageSize: 10,
//       pageToken: pageToken,
//     },
//     (err, res) => {
//       if (err) return console.log("API ERROR", err);
//       res.data.files.forEach((file) => {
//         console.log("Found file: ", file.name, file.id);
//       });
//        pageToken = res.nextPageToken;
//     }
//   );
// }
exports.authorize = authorize;
// exports.update = update;
