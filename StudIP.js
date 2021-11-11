const fetch = require("node-fetch");
const fs = require("fs");
const courses = require("./config.json").courses;

class StudIPInterface {
  constructor(apiURL, userData = { name, password }) {
    this.url = apiURL;
    this.userData = userData;

    this.foundFiles = [];
    this.hashFile = "hash.json";
    this.downloadPrefix = "files/";

    if (!fs.existsSync(this.downloadPrefix)) {
      fs.mkdirSync(this.downloadPrefix);
    }
  }

  async findFilesInCourse(course) {
    console.log(this.foundFiles);
    for (const folder of courses[course].folder) {
      const subfolder = await this.getAllFoldersInFolder(folder.id);

      if (subfolder.collection.length) {
        return await this.getAllFilesInFolder(folder.id, true);
      }
      let allFiles = await this.getAllFilesInFolder(folder.id, false);
      let re = new RegExp(folder.regex, "");
      this.foundFiles.push(
        allFiles.filter((file) => {
          return re.test(file.name);
        })
      );
      console.log(this.foundFiles);
    }
    return await this.downloadFoundFiles();
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

  async downloadFoundFiles() {
    if (!this.foundFiles.length) return false;

    const newFiles = this.testForNewFiles(this.foundFiles);
    console.info("Downloading " + newFiles.length + " new files.");

    for (const file of newFiles) {
      if (!fs.existsSync(this.downloadPrefix)) {
        fs.mkdirSync(this.downloadPrefix);
      }

      const data = await this.apiRequest(`/file/${file.id}/download`, "file");
      let buffer = Buffer.from(data);

      const path = `${this.downloadPrefix}/${file.name}`;
      fs.writeFile(path, buffer, "binary", () => {});
    }

    this.foundFiles = [];

    return true;
  }

  testForNewFiles(fileList) {
    try {
      if (fs.statSync(this.hashFile));
    } catch {
      console.log("Hashfile does not exist");
      fs.writeFileSync(
        this.hashFile,
        JSON.stringify({ lastModified: null, hashes: [] })
      );
    }
    const hashFile = JSON.parse(fs.readFileSync(this.hashFile));
    fileList = fileList.filter(
      (file) => !hashFile.hashes.find((val) => val == getHash(file))
    );

    fileList.map((file) => {
      hashFile.hashes.push(getHash(file));
    });
    hashFile.lastModified = Date.now();

    fs.writeFileSync(this.hashFile, JSON.stringify(hashFile, false, 2));
    return fileList;

    function getHash(file) {
      return `${file.file_id} ${file.name}`;
    }
  }

  async apiRequest(path, type) {
    let response = await fetch(this.url + path, {
      method: "GET",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            this.userData.name + ":" + this.userData.password
          ).toString("base64"),
      },
    }).catch((err) => {
      console.log(`ERROR: ${err}`);
    });
    if (!response.ok) {
      console.log(`ERROR: ${response.error} with ${path}`);
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

module.exports = StudIPInterface;
