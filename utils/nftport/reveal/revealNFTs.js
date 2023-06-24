// RUN:
// TODO: MANUAL => if START set it will check only what you want ONCE
//       AUTO   => if not set it will repeat with interval
// TODO: SYNC revealed/* local/remote
//       OR USE SINGLE service to reveal
// npm run reveal_custom --start=1 --end=2

// RUN IN THE BACKGROUND
// forever
// https://blog.logrocket.com/running-node-js-scripts-continuously-forever/

// NOTIFICATIONS
// Discord
// https://dev.to/johnmelodyme/how-to-send-message-to-specific-discord-channel-from-your-server-application-2n6h
// https://stackoverflow.com/questions/66180201/discord-js-send-a-webhook

require('dotenv').config();

const path = require("path");
const basePath = process.cwd();
const fs = require("fs");
const yesno = require('yesno');
const { RateLimit } = require("async-sema");
const { fetchWithRetry, } = require(`${basePath}/utils/functions/fetchWithRetry.js`);
const { txnCheck } = require(`${basePath}/utils/functions/txnCheck.js`);
const {
  MINT_TO_ADDRESS,
  CHAIN,
  LIMIT,
  INTERVAL,
  REVEAL_PROMPT
} = require(`${basePath}/src/config.js`);

const contractFile = `${basePath}/build/contract/_contract.json`;
const contractJson = JSON.parse(fs.readFileSync(contractFile));
const CONTRACT_ADDRESS = contractJson.contract_address;

const _limit = RateLimit(LIMIT);
let [START, END] = process.argv.slice(2);
START = parseInt(START);
END = parseInt(END);

// visible in both checkOwnedNFTs and reveal
let ownedNFTs = [];
// but if we reveal manuall EXACT items check is not started and it will be empty still
// so we will reveal ANY cause it looks like we don't own anything - owner check is stil there always
// but in checkOwnedNFTs we HAVE TO make it EMPTY at the beginning every time it is called in INTERVAL
// so we DONT add DUPLICATED values

async function checkOwnedNFTs() {
  ownedNFTs = [];

  try {
    let page = 1;
    let lastPage = 1;
    let url = `https://api.nftport.xyz/v0/accounts/${MINT_TO_ADDRESS}?chain=${CHAIN.toLowerCase()}&page_size=50&page_number=`;

    console.log(`url: ${url}`)

    let options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    // TODO: Initial Pre-fetch to Get Total NFTS and calc Pages count for per page 50
    let ownedNFTsData = await fetchWithRetry(`${url}${page}`, options);

    // JSON.stringify(obj, null, 4);
    // console.log(ownedNFTsData)

    for (const ownedNFT of ownedNFTsData.nfts) {
      console.log('compare CONTRACT_ADDRESS and ownedNFT.contract_address')
      console.log(CONTRACT_ADDRESS)
      console.log(ownedNFT.contract_address)
      console.log('ownedNFT.contract_address === CONTRACT_ADDRESS')
      console.log(ownedNFT.contract_address === CONTRACT_ADDRESS)

      // TODO: POSSIBLE WITH GOERLI AT LEAST:
      // For Same contract
      // Originally we have letters in Up / Low CASE after contract deploy
      // but API here returns contract address ONLY IN LOWER CASE...
      // Ex:
      // DEPLOYED: CONTRACT_ADDRESS           =>0xdb6eE38458Cc344DB50D2fC4B242477cc686c452
      // API     : ownedNFT.contract_address => 0xdb6ee38458cc344db50d2fc4b242477cc686c452
      // if such as problem possible in prod it will NOT FIND ANY OWNED NFT!
      // cause IF no match it LOOKS like ALL SOLD!
      // AND IT NEEDS TO REVEAL ALL...
      // So it can REVEAL ALL IMMEDIATELY BEFORE the very first SALE happened!
      // TODO: SO Be careful and debug first runs
      // TODO: For now I wil use lowercase cause it is very unlikely it can be wrong match

      if (ownedNFT.contract_address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
        ownedNFTs.push(parseInt(ownedNFT.token_id));
      }
    }

    if (ownedNFTs.length < 100) {
      console.log(`ownedNFTs: ${ownedNFTs}`)
    } else {
      console.log(`Too many ownedNFTs to show all in terminal...`)
    }

    lastPage = Math.ceil(ownedNFTsData.total / 50);

    while (page < lastPage) {
      page++;
      ownedNFTsData = await fetchWithRetry(`${url}${page}`, options);
      for (const ownedNFT of ownedNFTsData.nfts) {
        if (ownedNFT.contract_address === CONTRACT_ADDRESS) {
          // TODO filter revealed here or later
          ownedNFTs.push(parseInt(ownedNFT.token_id)); // TODO: just id - we can fetch from hash this way or get file with id name
        }
      }
    }
  } catch (error) {
    console.log(`Catch: Error: ${error}`);
  }

  console.log(`Found ${ownedNFTs.length} owned NFTs.`);
  console.log(`Revealing unowned NFTs...`);

  // TODO: run reveal inside check checkOwnedNFTs
  reveal();
}

async function reveal() {
  const realMetasPath = `${basePath}/build/real/ipfsMetas/_ipfsMetas.json`

  if (!fs.existsSync(path.join(`${basePath}/build`, "/revealed"))) {
    fs.mkdirSync(path.join(`${basePath}/build`, "revealed"));
  }

  const ipfsMetas = JSON.parse(
    fs.readFileSync(realMetasPath)
  );

  for (const meta of ipfsMetas) {
    // TODO: EDITION
    const edition = meta.custom_fields.edition;

    // TODO: START - END
    if (START && END) {
      if (edition < START || edition > END) {
        console.log(`skip not in range: ${edition}`)
        continue;
      }
    } else if (START) {
      if (edition < START) {
        console.log(`skip not in range: ${edition}`)
        continue;
      }
    }

    // TODO: AUTO => it checks and BUILDS ownedNFTs, then loop over existing and reveal if NOT owned
    // TODO: MANUAL => it DOES NOT check ownedNFTs (=>[]), so reveal ANYWAY - owner DOES NOT Matter
    if (!ownedNFTs.includes(edition)) {
      // TODO: WE COULD skip ALREADY REVEALED here
      console.log('TODO: WE COULD skip ALREADY REVEALED here')

      const revealedFilePath = `${basePath}/build/revealed/${edition}.json`;
      // TODO: reveal NOTEs
      // 1) First part here works with EXISTING FILE - updates status, checks transaction if status is stil not OK, etc
      // 2) else block trows an ERROR THAT IS CAUGHT in the second block where the ORIGINAL REVEAL HAPPENS
      try {
        fs.accessSync(revealedFilePath);
        const revealedFile = fs.readFileSync(revealedFilePath);

        if (revealedFile.length > 0) {
          const revealedFileJson = JSON.parse(revealedFile);

          // TODO: CHECK 1)
          //       existing file HAS updateData.response != OK => RETRY (from SCRATCH)
          if (revealedFileJson.updateData.response !== "OK") {
            throw `Not revealed , will retry revealing Edition #${edition}`;
          } else if(revealedFileJson.updateData.transaction_verified === true) {
            // TODO: CHECK 2)
            //       even if OK it also checks updateData.transaction_verified
            //       if BOTH checks passed => REVEALED
            console.log(`${meta.name} (edition: ${edition}) already revealed.`);
          } else {
            // TODO: CHECK 3)
            //       if OK, but NOT VERIFIED - it will make a REQUEST to check

            // TODO: WIL IT WORK ON NETLIFY??
            // TODO: WIL IT WORK ON NETLIFY??
            // TODO: WIL IT WORK ON NETLIFY??
            // TODO: WIL IT WORK ON NETLIFY?? - cause it opens browser in background locally....
            let check = await txnCheck(
              revealedFileJson.updateData.transaction_external_url
            );

            // TODO: CHECK 4)
            if (check.includes("Success")) {
              // TODO: VERIFIED!
              revealedFileJson.updateData.transaction_verified = true;

              fs.writeFileSync(revealedFilePath,JSON.stringify(revealedFileJson, null, 2));
              console.log(`${meta.name} (edition: ${edition}) already revealed.`);
            } else if (check.includes("Fail")) {
              // TODO: CHECK 5)
              //       check REQUEST failed
              //       NOT VERIFIED for now => RETRY (from SCRATCH)
              console.log(`Transaction failed or not found, will retry revealing Edition #${edition}`);
              throw `not revealed`;
            } else if(check.includes("Pending")) {
              // TODO: CHECK 6)
              //       PENDING
              //       NOT VERIFIED => RETRY (NEXT TIME, for existing file it will make REQUEST again)
              console.log(`Transaction transaction still pending for Edition #${edition}, will be checked NEXT TIME in INTERVAL`);
            } else {
              // TODO: CHECK 7)
              //       NOT VERIFIED - IMPOSSIBLE TO CHECK


              // TODO: THIS REQUIRES ADDITIONAL NOTIFICATION
              // TODO: THIS REQUIRES ADDITIONAL NOTIFICATION
              // TODO: THIS REQUIRES ADDITIONAL NOTIFICATION
              console.log(
                `Transaction unknown, please manually check Edition #${edition}`,
                `Directory: ${mintFile}`
              );
            }
          }

        } else {
          // TODO: CHECK 8)
          //       no file needs start INITIAL REVEAL process
          console.log(`File doesn't exists will do INITIAL REVEAL for Edition #${edition}`);
          throw "not revealed";
        }
      } catch (err) {
        // TODO: INITIAL REVEAL PROCESS
        let  ok = true;
        if (REVEAL_PROMPT) {
          ok = await yesno({
            question: `Reveal ${meta.name}? (edition: ${edition}) (y/n):`,
            default: null,
          });
        }
        if (ok) {
          try {
            await _limit();
            const url = "https://api.nftport.xyz/v0/mints/customizable";
            const updateInfo = {
              chain: CHAIN.toLowerCase(),
              contract_address: CONTRACT_ADDRESS,
              metadata_uri: meta.metadata_uri,
              token_id: meta.custom_fields.edition,
            };

            console.log('updateInfo:')
            console.log(updateInfo)

            const options = {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updateInfo),
            };

            // TODO: update request
            //       should have 2 important fields:
            //       response: "OK" => handled (BUT STILL MIGHTBE IN PROGRESS)
            //       "transaction_verified": true (VERIFIED)
            //       LIKELY first time we have ONLY response: 'OK'
            //       so it will be checked and confirmed 100% only NEXT TIME
            let updateData = await fetchWithRetry(url, options);

            const combinedData = {
              metaData: meta,
              updateData: updateData,
            };
            fs.writeFileSync(
              `${basePath}/build/revealed/${meta.custom_fields.edition}.json`,
              JSON.stringify(combinedData, null, 2)
              );
            console.log(`Updated transaction created for ${meta.name} (edition: ${edition})`);
          } catch (err) {
            console.log(err);
          }
        } else {
          console.log(`Skipped: ${meta.name} (edition: ${edition})`);
        }
      }
    }
  }
  if (!START) {
    console.log(
      `Done revealing! Will run again in ${INTERVAL / 1000 / 60} minutes`
    );
  } else {
    console.log(
      `Done revealing!`
    );
  }
  console.log("(To check IF errors, run command: npm run check_txns --dir=revealed)");
}

// TODO: MANUAL => if START set it will check only what you want ONCE
//       AUTO   => if not set it will repeat with interval
if (START) {
  reveal();
} else {
  // TODO: what if works?
  // if (CHAIN === 'goerli') {
  //   console.log('Goerli is not supported for checking ownership of NFTs.');
  //   process.exit(1);
  // }

  setInterval(checkOwnedNFTs, INTERVAL);
  checkOwnedNFTs();
}
