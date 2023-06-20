### Upload Files

`npm run upload_hidden_file`

Result:
- uploads file from build/hidden/images to IPFS
- adds hidden.json to `json/*` => "file_url" and "image" with ipfs url


### Upload Meta

_NOTE: we upload 1 hidden.json)_

`npm run upload_hidden_meta`

Result:
- uploads 1 json file to IPFS
- creates metaSource dir
- adds Source file to metaSource/hidden.json (will be used to generate All same metas on a next step)
- NOTE: for REAL metas it will be different cause - metas will be different anyway (name/desc) even if we use same 5 source files uploaded once on a first step  

### Generate Metas for All items (to use ready data in mint)

`npm run generate_hidden_meta --count=2`

Result:
- creates `ipfsMetas` with all the info ready to mint (ipfs to images and json files added)

### Deploy Contract <-- Env dependent things start here

`npm run deploy_contract`

### Get Contract

`npm run get_contract`

### Mint

`npm run mint --start=1 --end=2`

### CheckTransactions

`npm run check_hidden_txns --dir=minted --start=1 --end=2`
