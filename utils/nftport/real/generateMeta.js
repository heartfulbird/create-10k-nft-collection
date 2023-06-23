// TODO: NOT META JUST UPLOADED JSON DETAILS

// Based on real/metaSource/*.json
// RUN:
// npm run generate_real_meta --count=2

require('dotenv').config();

const path = require("path");
const basePath = process.cwd();
const fs = require("fs");

let [COUNT] = process.argv.slice(2);
COUNT = parseInt(COUNT) || null;

let metaSourcePath = `${basePath}/build/real/metaSource`;
let writeDir = `${basePath}/build/real/ipfsMetas`;

// Randomization
const randomLevelsMapPath = `${basePath}/build/real/random_levels_source/random_levels.json`;
const randomLevelsMap = fs.readFileSync(randomLevelsMapPath);
const randomLevelsMapData = JSON.parse(randomLevelsMap);

if (!fs.existsSync(path.join(writeDir))) {
  fs.mkdirSync(path.join(writeDir));
}

async function main() {
  // TODO: REWRITES i.json and _ipfsMetas.json from scratch based on source
  let allMetadata = [];
  const meta_path = `${writeDir}/_ipfsMetas.json`;

  for (let i = 1; i <= COUNT; i++) {
    console.log(`Generate meta for ID: ${i}`);

    let ID = i;
    let LEVEL = randomLevelsMapData[ID];

    console.log(`Mapping { ID: LEVEL } => { ${ID}: ${LEVEL} }`)

    // IMPORTANT - load every time, otherwise edition rewritten in all _ipfsMetas by last ID (same source object)
    let metaSource = fs.readFileSync(`${metaSourcePath}/${LEVEL}.json`);
    let metaData = JSON.parse(metaSource);

    if ((metaData.hasOwnProperty('custom_fields') === true) && (metaData['custom_fields'] !== null)) {
      metaData['custom_fields']['edition'] = ID
    } else {
      metaData['custom_fields'] = {}
      metaData['custom_fields']['edition'] = ID
    }

    metaData['custom_fields']['edition'] = ID

    // same i.json
    fs.writeFileSync(`${writeDir}/${ID}.json`, JSON.stringify(metaData, null, 2));
    // add to all
    allMetadata.push(metaData)
  }

  // save all
  fs.writeFileSync(meta_path, JSON.stringify(allMetadata, null, 2));
}

main();
