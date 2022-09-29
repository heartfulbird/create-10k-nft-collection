require('dotenv').config();

// TODO: diff between "collection" and "product" contracts
// https://docs.nftport.xyz/docs/nftport/ZG9jOjQ2NDA5NTU5-contract-comparison
// Ownable contract
// https://support.opensea.io/hc/en-us/articles/4403934341907-How-do-I-import-my-contract-automatically-
// Why the collections is not editable on OpenSea:
// 1. indexing takes up to 48 hours => https://nftport.notion.site/NFTPort-Frequently-asked-questions-5e0fb89737524766a63d443655035bae
// 2. how to make it editable otherwise https://betterprogramming.pub/how-to-integrate-your-nft-smart-contracts-with-opensea-b2925789a62f

const path = require("path");
const basePath = process.cwd();
const fs = require("fs");
const yesno = require('yesno');

const {
  fetchNoRetry,
} = require(`${basePath}/utils/functions/fetchWithRetry.js`);
const {
  CHAIN,
  CONTRACT_NAME,
  CONTRACT_SYMBOL,
  CONTRACT_TYPE,
  MINT_TO_ADDRESS,
  METADATA_UPDATABLE,
  ROYALTY_SHARE,
  ROYALTY_ADDRESS,
} = require(`${basePath}/src/config.js`);

const deployContract = async () => {
  const ok = await yesno({
    question: `Is all REQUIRED contract information correct in config.js? (y/n):`,
    default: null,
  });

  if(!ok) {
    console.log("Exiting...");
    process.exit(0);
  }

  if (!fs.existsSync(path.join(`${basePath}/build`, "/contract"))) {
    fs.mkdirSync(path.join(`${basePath}/build`, "contract"));
  }

  try {
    const url = `https://api.nftport.xyz/v0/contracts`;
    const contract = {
      chain: CHAIN.toLowerCase(),
      name: CONTRACT_NAME,
      symbol: CONTRACT_SYMBOL,
      owner_address: MINT_TO_ADDRESS,
      type: CONTRACT_TYPE,
      metadata_updatable: METADATA_UPDATABLE,
      royalties_share: ROYALTY_SHARE,
      royalties_address: ROYALTY_ADDRESS,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contract),
    };
    const response = await fetchNoRetry(url, options);
    fs.writeFileSync(`${basePath}/build/contract/_deployContractResponse.json`, JSON.stringify(response, null, 2));
    if(response.response === "OK") {
      console.log(`Contract ${CONTRACT_NAME} deployment started.`);
    } else {
      console.log(`Contract ${CONTRACT_NAME} deployment failed`);
    }
  } catch (error) {
    console.log(`CATCH: Contract ${CONTRACT_NAME} deployment failed`, `ERROR: ${error}`);
  }
};

deployContract();
