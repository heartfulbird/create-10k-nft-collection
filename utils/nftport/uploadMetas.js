// EXPECTED TO BE USED WITH BATCHES - it EXTENDS build/ipfsMetas/_ipfsMetas.json
// USAGE:
// npm run upload_metadata --start=1 --end=2
// npm run upload_metadata --start=3 --end=4

require('dotenv').config();

const path = require("path");
const basePath = process.cwd();
const fs = require("fs");

const {run_next_command} = require(`${basePath}/utils/functions/child_processes.js`);

const { RateLimit } = require("async-sema");
const { fetchWithRetry } = require(`${basePath}/utils/functions/fetchWithRetry.js`);

const { LIMIT, GENERIC } = require(`${basePath}/src/config.js`);
const _limit = RateLimit(LIMIT);

const regex = new RegExp("^([0-9]+).json$");
let genericUploaded = false;

let [START, END] = process.argv.slice(2);
START = parseInt(START) || null;
END = parseInt(END) || null;

if (!(START && END)) {
  throw 'Define START - END (Example: npm run upload_metadata --start=2 --end=2)'
}

if (!fs.existsSync(path.join(`${basePath}/build`, "/ipfsMetas"))) {
  fs.mkdirSync(path.join(`${basePath}/build`, "ipfsMetas"));
}

let readDir = `${basePath}/build/json`;
let writeDir = `${basePath}/build/ipfsMetas`;

async function main() {
  console.log(`Starting upload of ${GENERIC ? genericUploaded ? 'generic ' : '' : ''}metadata...`);
  let edition = null;

  // TODO: change it so it LOADS META IF EXISTS and adds new to the end of file (or even checks if such data isn't there already)
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

      edition = metaData.custom_fields.edition

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

      const uploadedMeta = `${writeDir}/${metaData.custom_fields.edition}.json`;

      try {
        fs.accessSync(uploadedMeta);
        const uploadedMetaFile = fs.readFileSync(uploadedMeta);
        if (uploadedMetaFile.length > 0) {
          const ipfsMeta = JSON.parse(uploadedMetaFile);
          if (ipfsMeta.response !== "OK") throw "metadata not uploaded";
          allMetadata.push(ipfsMeta);
          console.log(`${metaData.name} metadata already uploaded`);
        } else {
          throw "metadata not uploaded";
        }
      } catch (err) {
        try {
          await _limit();
          const url = "https://api.nftport.xyz/v0/metadata";
          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: jsonFile,
          };
          const response = await fetchWithRetry(url, options);
          allMetadata.push(response);
          fs.writeFileSync(uploadedMeta, JSON.stringify(response, null, 2));
          console.log(`${response.name} metadata uploaded!`);
        } catch (err) {
          console.log(`Catch: ${err}`);
        }
      }
    }
    fs.writeFileSync(
      `${writeDir}/_ipfsMetas.json`,
      JSON.stringify(allMetadata, null, 2)
    );

    next_command(edition);
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

function next_command(edition) {
  run_next_command(`npm run mint --start=${edition} --end=${edition} --confirmation=0`);
}

main();
