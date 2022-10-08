require('dotenv').config();

const FormData = require("form-data");
const path = require("path");
const basePath = process.cwd();
const fs = require("fs");

const { RateLimit } = require('async-sema');
const { fetchWithRetry } = require(`${basePath}/utils/functions/fetchWithRetry.js`);

const { LIMIT } = require(`${basePath}/src/config.js`);
const _limit = RateLimit(LIMIT);

const allMetadata = [];
const regex = new RegExp("^([0-9]+).png");

let [START, END] = process.argv.slice(2);
START = parseInt(START) || null;
END = parseInt(END) || null;

if (!(START && END)) {
  throw 'Define START - END (Example: npm run upload_files --start=2 --end=2)'
}

async function main() {
  console.log("Starting upload of images...");
  const files = fs.readdirSync(`${basePath}/build/images`);
  files.sort(function(a, b){
    return a.split(".")[0] - b.split(".")[0];
  });
  for (const file of files) {
    try {
      if (regex.test(file)) {
        const fileName = path.parse(file).name;

        if (START && fileName) {
          if (fileName < START) {
            continue;
          }
        }

        if (END && fileName) {
          if (fileName > END) {
            continue;
          }
        }

        let jsonFile = fs.readFileSync(`${basePath}/build/json/${fileName}.json`);
        let metaData = JSON.parse(jsonFile);

        if(!metaData.file_url.includes('https://')) {
          await _limit()
          const url = "https://api.nftport.xyz/v0/files";
          const formData = new FormData();
          const fileStream = fs.createReadStream(`${basePath}/build/images/${file}`);
          formData.append("file", fileStream);
          const options = {
            method: "POST",
            headers: {},
            body: formData,
          };
          const response = await fetchWithRetry(url, options);
          metaData.file_url = response.ipfs_url;
          metaData.image = response.ipfs_url;

          fs.writeFileSync(
            `${basePath}/build/json/${fileName}.json`,
            JSON.stringify(metaData, null, 2)
          );
          console.log(`${response.file_name} uploaded & ${fileName}.json updated!`);
        } else {
          console.log(`${fileName} already uploaded.`);
        }

        allMetadata.push(metaData);
      }
    } catch (error) {
      console.log(`Catch: ${error}`);
    }
  }

  fs.writeFileSync(
    `${basePath}/build/json/_metadata.json`,
    JSON.stringify(allMetadata, null, 2)
  );
}

main();
