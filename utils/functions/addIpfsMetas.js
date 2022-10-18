// TODO: didn't tested

require('dotenv').config();

const path = require("path");
const basePath = process.cwd();
const fs = require("fs");

const { GENERIC } = require(`${basePath}/src/config.js`);

const regex = new RegExp("^([0-9]+).json$");
let genericUploaded = false;

let [START, END] = process.argv.slice(2);
START = parseInt(START) || null;
END = parseInt(END) || null;

if (!(START && END)) {
  throw 'Define START - END (Example: npm run upload_ipfs_metadata --start=2 --end=2)'
}

// TODO: same DIR actually because we read results of uploaded json files
let readDir = `${basePath}/build/ipfsMetas`;
let writeDir = readDir;

async function main() {
  console.log(`Starting extending of ${GENERIC ? genericUploaded ? 'generic ' : '' : ''}metadata...`);

  let allMetadata = [];

  const meta_path = `${writeDir}/_ipfsMetas.json`;
  // TODO: it pre-loads existing data from _meta to EXTEND it with the new batch
  //       EXPECTED TO WORK WITH BATCHES ONLY THIS WAY
  //       (if BATCH was done successfully it will be ADDED TO EXISTING _meta no matter if data already exists)
  if (fs.existsSync(meta_path)) {
    let metaJsonFile = fs.readFileSync(meta_path);
    allMetadata = JSON.parse(metaJsonFile);
  }

  const files = fs.readdirSync(readDir);
  files.sort(function (a, b) {
    return a.split(".")[0] - b.split(".")[0];
  });
  for (const file of files) {
    if (regex.test(file)) {
      let jsonFile = fs.readFileSync(`${readDir}/${file}`);
      let metaData = JSON.parse(jsonFile);

      let edition = metaData.custom_fields.edition

      if (START && edition) {
        if (edition < START) {
          continue;
        }
      }

      if (END && edition) {
        if (edition > END) {
          continue;
        }
      }

      if (metaData.response !== "OK") throw "metadata not uploaded";

      allMetadata.push(metaData);
    }
    fs.writeFileSync(
      `${writeDir}/_ipfsMetas.json`,
      JSON.stringify(allMetadata, null, 2)
    );
  }

  // Upload Generic Metadata if GENERIC is true
  if (GENERIC && !genericUploaded) {
    if (!fs.existsSync(path.join(`${basePath}/build`, "/ipfsMetasGeneric"))) {
      fs.mkdirSync(path.join(`${basePath}/build`, "ipfsMetasGeneric"));
    }
    readDir = `${basePath}/build/genericJson`;
    writeDir = `${basePath}/build/ipfsMetasGeneric`;

    genericUploaded = true;
    main();
  }
}

main();
