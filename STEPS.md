### Generate
`npm run generate`

Result:
```
build
|-images/
|-json/
```
### Upload Files
`npm run upload_files`

Result:
- uploads images to IPFS
- in `json/*` => "file_url" updated with ipfs url

### Upload Metas
`npm run upload_metadata`

Result:
- uploaded json files to IPFS
- creates `jsonMetas` with all the info ready to mint (ipfs to images and json files added)
```
build
|-jsonMetas/
```


### Deploy Contract <-- Env dependent things start here
`npm run deploy_contract`

### Get Contract
`npm run get_contract`

### Mint
`npm run mint --start=1 --end=10`

### CheckTransactions
`npm run check_txns --dir=minted`
