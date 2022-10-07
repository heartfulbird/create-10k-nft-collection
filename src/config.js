require('dotenv').config();

const basePath = process.cwd();
const fs = require("fs");
const { MODE } = require(`${basePath}/constants/blend_mode.js`);
const { NETWORK } = require(`${basePath}/constants/network.js`);

const network = NETWORK.eth;

// TODO: WHERE IS THE PRICE?
//       part of LISTING https://youtu.be/Iy1n_LxUwZs?t=282

// General metadata for Ethereum
// TODO: config
const namePrefix = "Morning Flowers TEST";
// TODO: config
const description = "A collection of morning flowers collected in a fragrant secret garden. Bring home the one that matches your mood.";
const baseUri = "ipfs://NewUriToReplace"; // This will be replaced automatically

// If you have selected Solana then the collection starts from 0 automatically
const layerConfigurations = [
  {
    growEditionSizeTo: 2, // TODO: config
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
  width: 512, // TODO: config
  height: 512, // TODO: config
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
const LIMIT = 3; // Your API key rate limit // TODO: config
const CONTRACT_NAME = namePrefix; // Same as the namePrefix
const CONTRACT_SYMBOL = 'MFT'; // Shorter version of the Collection name // TODO: config
const CONTRACT_TYPE = 'erc721';
const MINT_TO_ADDRESS = process.env.WALLET_ADDRESS; // MetaMask


// TODO: rinkeby will be DEPRECATED 5 Oct
// 📢 The Rinkeby testnet explorer will be deprecated and set to read-only on October 5th, 2022. Please migrate your contracts and deploy new ones on Goerli or Sepolia.
// Read more here => https://twitter.com/etherscan/status/1569311894279958531
// NEW Alternatives:
// https://sepolia.etherscan.io/
// https://goerli.etherscan.io/
const CHAIN = process.env.CHAIN; // rinkeby (old test) or goerli (test) or polygon (prod)
const METADATA_UPDATABLE = false; // set to false if you don't want to allow metadata updates after minting
// TODO: config
const ROYALTY_SHARE = 1000; // Percentage of the token price that goes to the royalty address. 100 bps = 1%
const ROYALTY_ADDRESS = MINT_TO_ADDRESS; // Address that will receive the royalty

// ** OPTIONAL **

// TODO: SET MANUALLY AFTER Contract deploy
//       OR I SEE NOW I can use the result from get contract JSON after the deploy of contract
// let CONTRACT_ADDRESS = "0x6Aa79918FAd3C2EaCC11b6Cdd8757AbF4fB7a6Fe"; // If you want to manually include it

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
  // CONTRACT_ADDRESS,
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
