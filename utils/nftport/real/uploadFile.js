// TODO: NOT META JUST FILE DETAILS

// Put file(s) to /build/real/files/*
// RUN:
// npm run upload_real_file
// It wil upload the file and save json with its name and ipfs url

require('dotenv').config();

const FormData = require("form-data");
const path = require("path");
const basePath = process.cwd();
const fs = require("fs");

const { fetchWithRetry } = require(`${basePath}/utils/functions/fetchWithRetry.js`);

// TODO: check MAX FILE SIZE
// TODO: check MAX FILE SIZE
// TODO: check MAX FILE SIZE
// NFT Port max is 50MB (and paid plans dont have info about Max file size...)
// https://docs.nftport.xyz/reference/customizable-minting
// https://www.nftport.xyz/pricing

// TODO: add real
const REAL_TITLE = {
  1: 'Rebel Title Level A', // TODO: maybe "... A-Level"
  2: 'Rebel Title Level B',
  3: 'Rebel Title Level C',
  4: 'Rebel Title Level D',
  5: 'Rebel Title Level E',
}

// TODO: add real
const REAL_DESCRIPTION = {
  1: 'Rebel Description Level A',
  2: 'Rebel Description Level B',
  3: 'Rebel Description Level C',
  4: 'Rebel Description Level D',
  5: 'Rebel Description Level E',
}

// TODO: add real
const REAL_ATTRIBUTES = {
  1: [
    { "trait_type": "Level", "value": "A" },
    { "trait_type": "Role", "value": "Leader" }, // Leader
  ],
  2: [
    { "trait_type": "Level", "value": "B" },
    { "trait_type": "Role", "value": "Recruiter" }, // Hacker
  ],
  3: [
    { "trait_type": "Level", "value": "C" },
    { "trait_type": "Role", "value": "Hacker" }, // Doctor
  ],
  4: [
    { "trait_type": "Level", "value": "D" },
    { "trait_type": "Role", "value": "Mechanic" }, // Mechanic
  ],
  5: [
    { "trait_type": "Level", "value": "E" },
    { "trait_type": "Role", "value": "Doctor" }, // Recruiter
  ],
}

async function main() {
  console.log("Starting upload of files...");

  const files = fs.readdirSync(`${basePath}/build/real/files`);
  files.sort(function(a, b){
    return a.split(".")[0] - b.split(".")[0];
  });

  for (const file of files) {
    const fileName = path.parse(file).name;

    let json = {}

    let json_path = `${basePath}/build/real/json/${fileName}.json`
    let json_template_path = `${basePath}/templates/meta_real.json`

    // we dont check anything file just will be rewritten even if exists - common data from template
    // if (fs.existsSync(json_path)) {
    //   let json = fs.readFileSync(json_path);
    //   json = JSON.parse(json);
    // }

    let json_template = fs.readFileSync(json_template_path);
    json = JSON.parse(json_template);

    const url = "https://api.nftport.xyz/v0/files";
    const formData = new FormData();
    const fileStream = fs.createReadStream(`${basePath}/build/real/files/${file}`);
    formData.append("file", fileStream);
    const options = {
      method: "POST",
      headers: {},
      body: formData,
    };

    // REQUEST
    const response = await fetchWithRetry(url, options);
    // let response = { ipfs_url: 'ipfs_url_test' } // TODO: test

    json.name = REAL_TITLE[fileName]
    json.description = REAL_DESCRIPTION[fileName];
    json.attributes = REAL_ATTRIBUTES[fileName]

    json.file_url = response.ipfs_url; // temporary not included to final meta
    // json.image = response.ipfs_url; // for opensea IMAGE
    json.animation_url = response.ipfs_url;


    fs.writeFileSync(
      json_path,
      JSON.stringify(json, null, 2)
    );

    console.log(`${fileName} uploaded & ${fileName}.json updated!`);
  }
}

main();
