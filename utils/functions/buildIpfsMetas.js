// TODO: didn't tested....

require('dotenv').config();

const path = require("path");
const basePath = process.cwd();
const fs = require("fs");

const { GENERIC } = require(`${basePath}/src/config.js`);

const regex = new RegExp("^([0-9]+).json$");
let genericUploaded = false;

// TODO: same DIR actually because we read results of uploaded json files
let readDir = `${basePath}/build/ipfsMetas`;
let writeDir = readDir;

async function main() {
  console.log(`Starting extending of ${GENERIC ? genericUploaded ? 'generic ' : '' : ''}metadata...`);

  let allMetadata = [];

  const files = fs.readdirSync(readDir);
  files.sort(function (a, b) {
    return a.split(".")[0] - b.split(".")[0];
  });
  for (const file of files) {
    if (regex.test(file)) {
      let jsonFile = fs.readFileSync(`${readDir}/${file}`);
      let metaData = JSON.parse(jsonFile);

      if (metaData.response !== "OK") throw "metadata not uploaded";

      allMetadata.push(metaData);
    }
    fs.writeFileSync(
      `${writeDir}/_ipfsMetas.json`,
      JSON.stringify(allMetadata, null, 2)
    );
  }

  // Handle Generic Metadata if GENERIC is true
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
