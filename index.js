const StudIP = require("./StudIP");
const fs = require("fs");
const GoogleDrive = require("./GoogleDrive");

const config = require("./config.json");
const hashes = require("./hash.json").hashes;

studIpInterface = new StudIP();

(async function () {
  sync();
  setInterval(sync, 10 * 60 * 1000);
})();

// (async function () {
//   update();
//   setInterval(update, 60 * 1000);
// })();

async function sync() {
  for (course of config.courses) {
    console.info("####################");
    console.info(course.name);
    await studIpInterface.findFilesInCourse(course.prefix, course.id);
    await studIpInterface.downloadFoundFiles();
  }
  for (hash of hashes) {
    if (fs.existsSync(`${config.download_folder}${hash}`)) {
      fs.unlinkSync(`${config.download_folder}${hash}`);
    }
  }
}

// async function update() {
//   GoogleDrive.update();
// }
