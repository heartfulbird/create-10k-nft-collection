require('dotenv').config();

const basePath = process.cwd();
const fs = require("fs");
const { MODE } = require(`${basePath}/constants/blend_mode.js`);
const { NETWORK } = require(`${basePath}/constants/network.js`);

const network = NETWORK.eth;

// TODO: WHERE IS THE PRICE?
//       part of LISTING https://youtu.be/Iy1n_LxUwZs?t=282

// General metadata for Ethereum
const namePrefix = process.env.NAME_PREFIX;
const description = process.env.DESCRIPTION;
const EDITIONS_COUNT = process.env.EDITIONS_COUNT;
const WIDTH = process.env.WIDTH;
const HEIGHT = process.env.HEIGHT;

const baseUri = "ipfs://NewUriToReplace"; // This will be replaced automatically

// If you have selected Solana then the collection starts from 0 automatically
const layerConfigurations = [
  {
    growEditionSizeTo: EDITIONS_COUNT,
    layersOrder: [
      { name: "background" },
      { name: "vase" },
      { name: "basic flowers" },
      { name: "anemone" },
    ],
  },
];

const shuffleLayerConfigurations = false;

const debugLogs = false;

const format = {
  width: WIDTH,
  height: HEIGHT,
  smoothing: false,
};

const extraMetadata = {
  // external_url: "https://codecats.xyz", // Replace with your website or remove this line if you do not have one.
};

// NFTPort Info
// ** REQUIRED **
const AUTH = process.env.NFT_PORT_API_KEY;
// FREE PLAN   =>  3 is MAX
// GROWTH PLAN => 10 is MAX
// https://www.nftport.xyz/pricing
const LIMIT = process.env.RATE_LIMIT; // Your API key rate limit
const CONTRACT_NAME = namePrefix; // Same as the namePrefix
const CONTRACT_SYMBOL = process.env.CONTRACT_SYMBOL; // Shorter version of the Collection name
const CONTRACT_TYPE = 'erc721';
const MINT_TO_ADDRESS = process.env.WALLET_ADDRESS; // MetaMask

const CHAIN = process.env.CHAIN; // goerli (test) or polygon (prod)
const METADATA_UPDATABLE = false; // set to false if you don't want to allow metadata updates after minting
const ROYALTY_SHARE = process.env.ROYALTY_SHARE; // Percentage of the token price that goes to the royalty address. 100 bps = 1%
const ROYALTY_ADDRESS = MINT_TO_ADDRESS; // Address that will receive the royalty

// ** OPTIONAL **
// Generic Metadata is optional if you want to reveal your NFTs
const GENERIC = false; // Set to true if you want to upload generic metas and reveal the real NFTs in the future
const GENERIC_TITLE = "Unknown"; // Replace with what you want the generic titles to say.
const GENERIC_DESCRIPTION = "Unknown"; // Replace with what you want the generic descriptions to say.
const GENERIC_IMAGE = [
  // "https://ipfs.io/ipfs/QmUf9tDbkqnfHkQaMdFWSGAeXwVXWA61pFED7ypx4hcsfh",
]; // Replace with your generic image(s). If multiple, separate with a comma.
const REVEAL_PROMPT = true; // Set to false if you want to disable the prompt to confirm each reveal.
const INTERVAL = 900000; // Milliseconds. This is the interval for it to check for sales and reveal the NFT. 900000 = 15 minutes.

// Automatically set contract address if deployed using the deployContract.js script
try {
  const rawContractData = fs.readFileSync(
    `${basePath}/build/contract/_contract.json`
  );
  const contractData = JSON.parse(rawContractData);
  if (contractData.response === "OK" && contractData.error === null) {
    CONTRACT_ADDRESS = contractData.contract_address;
  }
} catch (error) {
  // Do nothing, falling back to manual contract address
}
// END NFTPort Info

const solanaMetadata = {
  symbol: "YC",
  seller_fee_basis_points: 1000, // Define how much % you want from secondary market sales 1000 = 10%
  external_url: "https://www.youtube.com/c/hashlipsnft",
  creators: [
    {
      address: "7fXNuer5sbZtaTEPhtJ5g5gNtuyRoKkvxdjEjEnPN4mC",
      share: 100,
    },
  ],
};

const gif = {
  export: false,
  repeat: 0,
  quality: 100,
  delay: 500,
};

const text = {
  only: false,
  color: "#ffffff",
  size: 20,
  xGap: 40,
  yGap: 40,
  align: "left",
  baseline: "top",
  weight: "regular",
  family: "Courier",
  spacer: " => ",
};

const pixelFormat = {
  ratio: 2 / 128,
};

const background = {
  generate: true,
  brightness: "80%",
  static: false,
  default: "#000000",
};

const rarityDelimiter = "#";

const uniqueDnaTorrance = 10000;

const preview = {
  thumbPerRow: 5,
  thumbWidth: 50,
  imageRatio: format.height / format.width,
  imageName: "preview.png",
};

const preview_gif = {
  numberOfImages: 5,
  order: "ASC", // ASC, DESC, MIXED
  repeat: 0,
  quality: 100,
  delay: 500,
  imageName: "preview.gif",
};

module.exports = {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  preview,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  pixelFormat,
  text,
  namePrefix,
  network,
  solanaMetadata,
  gif,
  preview_gif,
  AUTH,
  LIMIT,
  MINT_TO_ADDRESS,
  CHAIN,
  GENERIC,
  GENERIC_TITLE,
  GENERIC_DESCRIPTION,
  GENERIC_IMAGE,
  INTERVAL,
  CONTRACT_NAME,
  CONTRACT_SYMBOL,
  CONTRACT_TYPE,
  REVEAL_PROMPT,
  METADATA_UPDATABLE,
  ROYALTY_SHARE,
  ROYALTY_ADDRESS,
};
