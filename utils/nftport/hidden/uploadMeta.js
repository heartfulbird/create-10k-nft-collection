// TODO: NOT META JUST UPLOADED JSON DETAILS

// Based on hidden/json/*
// RUN:
// npm run upload_hidden_meta
// To check ipfs use format
// https://ipfs.io/ipfs/bafkreihjd7yubl4t2due4itq4ejrf52mnnq5efxvwqg6mdbjisbwb6hocu

require('dotenv').config();

const path = require("path");
const basePath = process.cwd();
const fs = require("fs");

const { RateLimit } = require("async-sema");
const { fetchWithRetry } = require(`${basePath}/utils/functions/fetchWithRetry.js`);

const { LIMIT, GENERIC } = require(`${basePath}/src/config.js`);
const _limit = RateLimit(LIMIT);

if (!fs.existsSync(path.join(`${basePath}/build/hidden`, "/metaSource"))) {
  fs.mkdirSync(path.join(`${basePath}/build/hidden`, "metaSource"));
}

let readDir = `${basePath}/build/hidden/json`;
let writeDir = `${basePath}/build/hidden/metaSource`;

async function main() {
  console.log(`Starting upload of generic metadata...`);

  const files = fs.readdirSync(readDir);
  files.sort(function (a, b) {
    return a.split(".")[0] - b.split(".")[0];
  });

  for (const file of files) {
    const fileName = path.parse(file).name;

    let jsonFile = fs.readFileSync(`${readDir}/${file}`);
    let metaData = JSON.parse(jsonFile);

    const uploadedMeta = `${writeDir}/${fileName}.json`;

    try {
      fs.accessSync(uploadedMeta);
      const uploadedMetaFile = fs.readFileSync(uploadedMeta);
      if (uploadedMetaFile.length > 0) {
        const ipfsMeta = JSON.parse(uploadedMetaFile);
        if (ipfsMeta.response !== "OK") throw "metadata not uploaded";
        console.log(`${metaData.name} metadata already uploaded`);
      } else {
        throw "metadata not uploaded";
      }
    } catch (err) {
      try {
        await _limit(); // TODO: FIX - we have RPS limit, we dont wait X seconds or mili we can do X per sec so to find waiting time between we need to calc 1/X or 1000/X etc
        const url = "https://api.nftport.xyz/v0/metadata";
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: jsonFile,
        };

        const response = await fetchWithRetry(url, options);
        // let response = { response: 'OK' } // TODO: test

        fs.writeFileSync(uploadedMeta, JSON.stringify(response, null, 2));
        console.log(`${response.name} metadata uploaded!`);
      } catch (err) {
        console.log(`Catch: ${err}`);
      }
    }
  }
}

main();
