// TODO: NOT META JUST UPLOADED JSON DETAILS

// Based on hidden/metaSource/hidden.json
// RUN:
// npm run generate_hidden_meta --count=2

require('dotenv').config();

const path = require("path");
const basePath = process.cwd();
const fs = require("fs");

let [COUNT] = process.argv.slice(2);
COUNT = parseInt(COUNT) || null;

let metaSourcePath = `${basePath}/build/hidden/metaSource/hidden.json`;
let writeDir = `${basePath}/build/hidden/ipfsMetas`;

if (!fs.existsSync(path.join(writeDir))) {
  fs.mkdirSync(path.join(writeDir));
}

async function main() {
  const metaSource = fs.readFileSync(metaSourcePath);

  // TODO: REWRITES i.json and _ipfsMetas.json from scratch based on source
  let allMetadata = [];
  const meta_path = `${writeDir}/_ipfsMetas.json`;

  for (let i = 1; i <= COUNT; i++) {
    console.log(`Generate meta for ID: ${i}`);

    // IMPORTANT - load every time, otherwise edition rewritten in all _ipfsMetas by last ID (same source object)
    let metaData = JSON.parse(metaSource);

    if ((metaData.hasOwnProperty('custom_fields') === true) && (metaData['custom_fields'] !== null)) {
      metaData['custom_fields']['edition'] = i
    } else {
      metaData['custom_fields'] = {}
      metaData['custom_fields']['edition'] = i
    }

    metaData['custom_fields']['edition'] = i

    // same i.json
    fs.writeFileSync(`${writeDir}/${i}.json`, JSON.stringify(metaData, null, 2));
    // add to all
    allMetadata.push(metaData)
  }

  // save all
  fs.writeFileSync(meta_path, JSON.stringify(allMetadata, null, 2));
}

main();
