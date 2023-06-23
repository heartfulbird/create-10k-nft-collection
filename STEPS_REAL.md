### Upload Files

`npm run upload_real_file`

Result:
- uploads All files (1 for every level) from build/hidden/files to IPFS
- adds filename.json to `json/*` => "file_url" and "animation_url" with ipfs url


### Upload Meta

_NOTE: we upload All *.json for all Levels_

`npm run upload_real_meta`

Result:
- uploads All json files to IPFS (1 for each level)
- creates metaSource dir
- adds Source file to metaSource/hidden.json (will be used to generate All same metas on a next step)
- NOTE: for REAL metas it could be different also if we want metas with different name even for same level (ID in name) but this time I'm going to use same meta for NFT of same level - even same Name 


### Generate Metas for All items (to use in reveal and update data)

`npm run generate_real_meta --count=2`

Result:
- creates `ipfsMetas` with all the info ready to update meta (ipfs to images and json files added)

### Contract HAS to be deployed already

[//]: # (### Deploy Contract <-- Env dependent things start here)

[//]: # ()
[//]: # (`npm run deploy_contract`)

[//]: # ()
[//]: # (### Get Contract)

[//]: # ()
[//]: # (`npm run get_contract`)

### Mint - We DONT mint, we update meta on Reveal step

[//]: # (`npm run mint_real --start=1 --end=2`)

### CheckTransactions - nothing to check casue we dont mint

[//]: # (`npm run check_real_txns --dir=minted --start=1 --end=2`)
