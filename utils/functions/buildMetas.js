// EXPECTED TO BE USED FOR ALL FILES TO BUILD METAS FROM SCRATCH
// USAGE:
// npm run build_metas

require('dotenv').config();

const fs = require("fs");

const path = require("path");

const regex = new RegExp("^([0-9]+).json$");

const basePath = process.cwd();

let allMetadata = [];

async function main() {
  console.log("Starting to BUILD AND RE-WRITE '_metadata.json' FROM SCRATCH ...");
  const files = fs.readdirSync(`${basePath}/build/json`);
  files.sort(function(a, b){
    return a.split(".")[0] - b.split(".")[0];
  });
  for (const file of files) {
    if (regex.test(file)) {
      try {
        const fileName = path.parse(file).name;

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
