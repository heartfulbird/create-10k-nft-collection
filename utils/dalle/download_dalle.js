require('dotenv').config();

const path = require("path");
const basePath = process.cwd();
const meta_path = `${basePath}/build/json/_metadata.json`;
const fs = require("fs");
const https = require("https");
const {run_next_command} = require(`${basePath}/utils/functions/child_processes.js`);

// const {
//   fetchWithRetry,
// } = require(`${basePath}/utils/functions/fetchWithRetry.js`);
// const options = {
//   method: "GET"
// };

const buildDir = `${basePath}/build`;
const { NETWORK } = require(`${basePath}/constants/network.js`);
const {
  baseUri,
  description,
  extraMetadata,
  namePrefix,
  network,
  solanaMetadata,
} = require(`${basePath}/src/config.js`);
const sha1 = require(`${basePath}/node_modules/sha1`);
let metadataList = [];

async function downloadFile (url, targetFile) {
  return await new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(`${basePath}/build`, "/images"))) {
      fs.mkdirSync(path.join(`${basePath}/build`, "images"));
    }

    https.get(url, response => {
      const code = response.statusCode ?? 0

      if (code >= 400) {
        return reject(new Error(response.statusMessage))
      }

      // handle redirects
      if (code > 300 && code < 400 && !!response.headers.location) {
        return downloadFile(response.headers.location, targetFile)
      }

      // save the file to disk
      const fileWriter = fs
        .createWriteStream(targetFile)
        .on('finish', () => {
          resolve({})
        })

      response.pipe(fileWriter)
    }).on('error', error => {
      reject(error)
    })
  })
}

function get_edition_and_attributes() {
  const files = fs.readdirSync(`${basePath}/build/dalle`);
  files.sort(function (a, b) {
    return a.split(".")[0] - b.split(".")[0];
  });

  let edition = 0

  if (files.length == 0) {
    throw 'No images generated'
  } else {
    edition = files[files.length - 1].split('.')[0]
  }

  let jsonFile = fs.readFileSync(
    `${basePath}/build/dalle/${edition}.json`
  );
  let data = JSON.parse(jsonFile);
  let url = data.data.data[0].url;
  let title = data.data.title;
  let description = data.data.description;
  let artist = data.data.artist;
  let date = data.data.date;

  return { edition, url, title, description, artist, date };
}

const addMetadata = (_edition, _description, _attributes) => {
  // const dna = sha1(_dna); // TODO: _dna is random in this case
  // but if we need to have same way encoded unique hash of attributes
  // so we avoid duplicates then use attributes
  const dna = sha1(`${_attributes.title}_${_attributes.date}_${_attributes.artist}`);

  let dateTime = Date.now();

  // TODO: use     description if you need generic description for each item
  //       or use _description if you need custom - Item related description built on the generation step

  // const desc = description
  const desc = _description

  const attributesList = buildAttributesList(_attributes);

  let tempMetadata = {
    name: `${namePrefix} #${_edition}`,
    description: desc,
    file_url: `${baseUri}/images/${_edition}.png`,
    image: `${baseUri}/images/${_edition}.png`,
    attributes: attributesList,
    custom_fields: {
      dna: dna,
      edition: _edition,
      date: dateTime,
      compiler: "HashLips Art Engine - codeSTACKr Modified - heartfulbird modified",
    },
    ...extraMetadata,
  };
  if (network == NETWORK.sol) {
    tempMetadata = {
      //Added metadata for solana
      name: tempMetadata.name,
      symbol: solanaMetadata.symbol,
      description: tempMetadata.description,
      //Added metadata for solana
      seller_fee_basis_points: solanaMetadata.seller_fee_basis_points,
      image: `image.png`,
      //Added metadata for solana
      external_url: solanaMetadata.external_url,
      edition: _edition,
      ...extraMetadata,
      attributes: tempMetadata.attributes,
      properties: {
        files: [
          {
            uri: "image.png",
            type: "image/png",
          },
        ],
        category: "image",
        creators: solanaMetadata.creators,
      },
    };
  }

  // TODO: EXTENDS EXISTING FILE, EXPECTED TO BE USED WITH one by one adding ONLY (to avoid duplicates)
  if (fs.existsSync(meta_path)) {
    let metaJsonFile = fs.readFileSync(meta_path);
    metadataList = JSON.parse(metaJsonFile);
  }

  metadataList.push(tempMetadata);

  // Save 1 file
  fs.writeFileSync(
    `${buildDir}/json/${_edition}.json`,
    JSON.stringify(tempMetadata, null, 2)
  );

  // Write all
  fs.writeFileSync(`${buildDir}/json/_metadata.json`, JSON.stringify(metadataList, null, 2));
};

async function main() {
  ensure_dir('json');

  const { edition, url, title, description, artist, date } = get_edition_and_attributes();
  // console.log(edition, url, title, description, artist, date)

  const targetFile = `${basePath}/build/images/${edition}.png`

  // TODO test mute
  await downloadFile(url, targetFile)

  // const dna = crypto.randomUUID();

  // TODO: custom attrs
  const attributes = {
    title, // News title
    date, // news date
    artist // Artist
  }

  addMetadata(edition, description, attributes)

  next_command(edition);
}

function buildAttributesList(attributes) {
  return Object.entries(attributes).map(([k,v]) => (
      { trait_type: k, value: v }
    ))
}

function ensure_dir(dir) {
  if (!fs.existsSync(path.join(`${basePath}/build`, `/${dir}`))) {
    fs.mkdirSync(path.join(`${basePath}/build`, dir));
  }
}

function next_command (edition) {
  run_next_command(`npm run upload_files --start=${edition} --end=${edition}`);
}

main();
