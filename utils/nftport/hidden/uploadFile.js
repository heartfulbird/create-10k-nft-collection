// TODO: NOT META JUST FILE DETAILS

// Put file(s) to /build/hidden/images/*
// RUN:
// npm run upload_hidden_file
// It wil upload the file and save json with its name and ipfs url

require('dotenv').config();

const FormData = require("form-data");
const path = require("path");
const basePath = process.cwd();
const fs = require("fs");

const { fetchWithRetry } = require(`${basePath}/utils/functions/fetchWithRetry.js`);

const {
  GENERIC_TITLE,
  GENERIC_DESCRIPTION,
} = require(`${basePath}/src/config.js`);

async function main() {
  console.log("Starting upload of images...");

  const files = fs.readdirSync(`${basePath}/build/hidden/images`);
  files.sort(function(a, b){
    return a.split(".")[0] - b.split(".")[0];
  });

  for (const file of files) {
    const fileName = path.parse(file).name;

    let json = {} // TODO: use template so it passes meta uploading

    let json_path = `${basePath}/build/hidden/json/${fileName}.json`
    let json_template_path = `${basePath}/templates/meta_hidden.json`

    // we dont check anything file just will be rewritten even if exists - common data from template
    // if (fs.existsSync(json_path)) {
    //   let json = fs.readFileSync(json_path);
    //   json = JSON.parse(json);
    // }

    let json_template = fs.readFileSync(json_template_path);
    json = JSON.parse(json_template);

    const url = "https://api.nftport.xyz/v0/files";
    const formData = new FormData();
    const fileStream = fs.createReadStream(`${basePath}/build/hidden/images/${file}`);
    formData.append("file", fileStream);
    const options = {
      method: "POST",
      headers: {},
      body: formData,
    };

    // REQUEST
    const response = await fetchWithRetry(url, options);
    // let response = { ipfs_url: 'ipfs_url_test' } // TODO: test

    json.name = GENERIC_TITLE
    json.description = GENERIC_DESCRIPTION;
    json.file_url = response.ipfs_url; // temporary not included to final meta
    json.image = response.ipfs_url; // for opensea IMAGE
    // json.animation_url = response.ipfs_url; // TODO: for opensea VIDEO

    fs.writeFileSync(
      json_path,
      JSON.stringify(json, null, 2)
    );

    console.log(`${fileName} uploaded & ${fileName}.json updated!`);
  }
}

main();
