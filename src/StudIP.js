const fetch = require("node-fetch");
const fs = require("fs");

const GoogleDrive = require("./GoogleDrive");
const secrets = require("./config/studip/secrets.json").stud_ip;
const url = require("./config/studip/config.json").studipURL;
const downloadPrefix = require("./config/studip/config.json").download_folder;

const hashFile = "config/studip/data/hash.json";

var foundFiles = null;

class StudIP {
  constructor() {
    if (!fs.existsSync(downloadPrefix)) {
      fs.mkdirSync(downloadPrefix);
    }
  }

  async downloadFoundFiles(haKey) {
    if (!foundFiles) return;
    let newFiles = this.testForNewFiles(foundFiles);
    console.info(`Downloading ${newFiles.length} new files.`);
    const paths = [];
    for (const file of newFiles) {
      const path = downloadPrefix + file.name;
      if (!fs.existsSync(downloadPrefix)) {
        fs.mkdirSync(downloadPrefix);
      }
      const data = await this.apiRequest(`/file/${file.id}/download`, "file");
      let buffer = Buffer.from(data);
      fs.writeFile(path, buffer, "binary", () => {});
      paths.push(path);
      await GoogleDrive.authorize(file.name, file.mime_type, haKey);
    }
    foundFiles = null;
    return paths;
  }

  testForNewFiles(fileList) {
    try {
      fs.statSync(hashFile);
    } catch {
      console.log("Hashfile doesn't exists");
      return [];
    }
    let hash = JSON.parse(fs.readFileSync(hashFile));
    fileList = fileList.filter(
      (file) => !hash.hashes.find((val) => val == getHash(file))
    );

    fileList.map((file) => {
      hash.hashes.push(getHash(file));
    });
    hash.lastModified = Date.now();

    fs.writeFileSync(hashFile, JSON.stringify(hash, false, 2));
    return fileList;

    function getHash(file) {
      return file.name;
    }
  }

  async findFilesInCourse(fileName, courseId) {
    const res = await this.apiRequest(`course/${courseId}/top_folder`);
    let allFiles = await this.getAllFilesInFolder(res.id, true);

    let re = new RegExp(fileName);
    foundFiles = allFiles.filter((file) => {
      return re.test(file.name);
    });

    return allFiles;
  }

  async getAllFilesInFolder(folderId, recursive = false) {
    const files = await this.apiRequest(`folder/${folderId}/files`);

    const allFiles = [];

    if (!files) return allFiles;
    for (const file in files.collection) allFiles.push(files.collection[file]);

    if (recursive) {
      const res = await this.getAllFoldersInFolder(folderId);

      for (const folder in res.collection) {
        const recursiveFiles = await this.getAllFilesInFolder(
          res.collection[folder].id,
          true
        );
        allFiles.push(...recursiveFiles);
      }
    }

    return allFiles;
  }

  async getAllFoldersInFolder(folderId) {
    const res = await this.apiRequest(`folder/${folderId}/subfolders`);
    return res;
  }

  async apiRequest(path, type) {
    let response = await fetch(url + path, {
      method: "GET",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${secrets.name}:${secrets.password}`).toString("base64"),
      },
    });

    if (!response.ok) {
      console.log("ERROR");
      return;
    }

    switch (type) {
      case "text":
        response = await response.text();
        break;
      case "file":
        response = await response.arrayBuffer();
        break;
      default:
        response = await response.json();
    }

    return response;
  }
}

module.exports = StudIP;
