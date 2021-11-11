const StudIP = require("./StudIP");

const credentials = require("./secrets.json");
const config = require("./config.json");
const courses = config.courses;
const url = config.url;

studIpInterface = new StudIP(url, credentials);

(async function () {
  run();
  setInterval(run, 6000);
})();

async function run() {
  for (i = 0; i < courses.length; i++) {
    console.info("####################");
    console.info(courses[i].name);

    console.log(await studIpInterface.findFilesInCourse(i));
  }
}
