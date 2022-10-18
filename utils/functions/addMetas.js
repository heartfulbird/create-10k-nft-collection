// EXPECTED TO BE USED IN BATCHES ONLY - it ADDS NEW DATA TO EXISTING
// USAGE:
// npm run add_metas --start=1 --end=10
// npm run add_metas --start=11 --end=20
// etc ...

require('dotenv').config();

const fs = require("fs");

const path = require("path");

const regex = new RegExp("^([0-9]+).json$");

const basePath = process.cwd();

let allMetadata = [];

const meta_path = `${basePath}/build/json/_metadata.json`;

// TODO: EXTENDS EXISTING FILE, EXPECTED TO BE USED WITH BATCHES ONLY
if (fs.existsSync(meta_path)) {
  let metaJsonFile = fs.readFileSync(meta_path);
  allMetadata = JSON.parse(metaJsonFile);
}

let [START, END] = process.argv.slice(2);
START = parseInt(START) || null;
END = parseInt(END) || null;

if (!(START && END)) {
  throw 'Define START - END (Example: npm run add_metas --start=2 --end=2)'
}

async function main() {
  console.log("Starting to modify '_metadata.json' ...");
  const files = fs.readdirSync(`${basePath}/build/json`);
  files.sort(function(a, b){
    return a.split(".")[0] - b.split(".")[0];
  });
  for (const file of files) {
    if (regex.test(file)) {
      try {
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
        allMetadata.push(metaData);
      } catch (error) {
        console.log(`Catch: ${error}`);
      }
    }
  }

  fs.writeFileSync(
    `${basePath}/build/json/_metadata.json`,
    JSON.stringify(allMetadata, null, 2)
  );

  console.log(`${basePath}/build/json/_metadata.json updated!`);
}

main();
