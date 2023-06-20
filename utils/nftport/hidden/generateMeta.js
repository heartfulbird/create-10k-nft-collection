// TODO: NOT META JUST UPLOADED JSON DETAILS

// Based on hidden/json/*
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
  let metaData = JSON.parse(metaSource);

  // TODO: rewrites all from scratch
  let allMetadata = [];
  const meta_path = `${writeDir}/_ipfsMetas.json`;

  for (let i = 1; i <= COUNT; i++) {
    console.log(`Generate meta for ID: ${i}`);

    // same i.json
    fs.writeFileSync(`${writeDir}/${i}.json`, JSON.stringify(metaData, null, 2));
    // add to all
    allMetadata.push(metaData)
  }

  // save all
  fs.writeFileSync(meta_path, JSON.stringify(allMetadata, null, 2));
}

main();
