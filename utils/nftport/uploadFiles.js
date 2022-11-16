require('dotenv').config();

const FormData = require("form-data");
const path = require("path");
const basePath = process.cwd();
const fs = require("fs");

const {run_next_command} = require(`${basePath}/utils/functions/child_processes.js`);

const { RateLimit } = require('async-sema');
const { fetchWithRetry } = require(`${basePath}/utils/functions/fetchWithRetry.js`);

const { LIMIT } = require(`${basePath}/src/config.js`);
const _limit = RateLimit(LIMIT);

let allMetadata = [];
const meta_path = `${basePath}/build/json/_metadata.json`;
// TODO: it pre-loads existing data from _meta to EXTEND it with the new batch
//       EXPECTED TO WORK WITH BATCHES ONLY THIS WAY
//       (if BATCH was done successfully it will be ADDED TO EXISTING _meta no matter if data already exists)
if (fs.existsSync(meta_path)) {
  let metaJsonFile = fs.readFileSync(meta_path);
  allMetadata = JSON.parse(metaJsonFile);
}

const regex = new RegExp("^([0-9]+).png");

let [START, END] = process.argv.slice(2);
START = parseInt(START) || null;
END = parseInt(END) || null;

if (!(START && END)) {
  throw 'Define START - END (Example: npm run upload_files --start=2 --end=2)'
}

async function main() {
  let fileName = '';

  console.log("Starting upload of images...");
  const files = fs.readdirSync(`${basePath}/build/images`);
  files.sort(function(a, b){
    return a.split(".")[0] - b.split(".")[0];
  });
  for (const file of files) {
    try {
      if (regex.test(file)) {
        fileName = path.parse(file).name;

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

        // TODO: INITIALLY it worked this way without START - END:
        //       even if something failed in the middle
        //       it was possible to restart from scratch
        //       then it could iterate through all items
        //       upload ONLY if https is not replaced with ipfs
        //       BUT IF ALREADY uploaded it was reading existing JSON for that such files
        //       and IN THE END it rewrites the whole _metadata
        //       only when ALL UPLOADED and FINISHED SUCCESFULLY
        //       BUT it WAS NOT building _metadata partially using START - END
        //       and it WAS NOT reading existing _metadata
        //       because any process that FAILED and done only PARTIALLY just was not adding anything to _metadata
        //
        //       NOW it REQUIRES START - END
        //       and it WILL ADD ALL JSON to _metadata if BATCH was DONE SUCCESSFULLY
        //       so IF ONE BATCH WAS DONE SUCCESFULLY THEN _metadata ALREADY exists and PARTIALLY FILLED
        //       IN THIS CASE for the NEXT batch it now HAS TO READ EXISTING _metadata and ADD ONLY NEW for next BATCH!
        //       so THIS WAY IT CANT BE STARTED FROM SCRATCH - BECAUSE IN THIS CASE IT CAN ADD DUPLICATIONS to existing _metadata
        //       ALSO NOW it has potential problem that IF it FAILS it also doesn't add anything to _metadata
        //       BUT it can be fixed IF you re-start script for the SAME BATCH \
        //       and it will work as it was expected initially:
        //       so it will just skip uploading for what already uploaded BUT ALSO COLLECT it
        //       and  SAVE ALL in _metadata for THAT BATCH
        //       TODO:L in other WORDS IT REQUIRES MORE CONTROL of final OUTPUT (_metadata) TO SUPPORT PARTIAL UPLOADING
        //       it is not idempotent if you run SUCCESSFULL script TWICE - it can duplicated entries
        //       it is IDEMPOTENT if BATCH FAILED - you can run the script with same params
        //       and if it finishes SUCCESSFULLY - then iteMs for THAT BATCH IWL BE ADDED TO _METADATA
        //       SO IT NEEDS TO TRACK IF IT WAS DONE SUCCESSFULLY
        //       YOU CAN RE-RUN ONLY IF FAILED and ONLY SAME BATCH
        //       if BATCH was DONE you only can run THE NEXT ONE to add NEW data to _metadata
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

        // TODO:
        // This replaces dat in json BUT this way we also update _metadata one more time here
        // so to support on by one handling we need to REPLACE old with new json data in _metadata
        allMetadata = allMetadata.filter(hh => hh.name !== metaData.name)

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

  next_command(fileName);
}

function next_command(edition) {
  run_next_command(`npm run upload_metadata --start=${edition} --end=${edition}`);
}

main();
