const StudIP = require("./StudIP");
const fs = require("fs");
// const GoogleDrive = require("./GoogleDrive");

const config = require("./config/studip/config.json");
const hashes = require("./config/studip/data/hash.json").hashes;
const haKey = process.argv.slice(2)[0];

const studIpInterface = new StudIP();

async function sync() {
  for (let course of config.courses) {
    console.info("####################");
    console.info(course.name);
    await studIpInterface.findFilesInCourse(course.prefix, course.id);
    await studIpInterface.downloadFoundFiles(haKey);
  }
  for (let hash of hashes) {
    if (fs.existsSync(`${config.download_folder}${hash}`)) {
      fs.unlinkSync(`${config.download_folder}${hash}`);
    }
  }
}

// async function update() {
//   GoogleDrive.update();
// }

(async function () {
  sync();
  setInterval(sync, 10 * 60 * 1000);
})();

// (async function () {
//   update();
//   setInterval(update, 60 * 1000);
// })();
