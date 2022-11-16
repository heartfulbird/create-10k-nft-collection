### TODO: 
#### for all 101 artists check it can generate image

### Themes
#### - Smoothie
#### - Pizza


### Deploy Contract (ONCE) <-- Env dependent things
`npm run deploy_contract`

### Get Contract (ONCE)
`npm run get_contract`

___

### Fetch news
`npm run fetch_news`

Result:
- fetches last day Top news from News API
- saves info as json file in `news/*`

```
build
|-news/
  |-*.json/
```


### Generate Image
`npm run generate_dalle`

Result:
- generates 1 image (based on news) using Dalle (detects new_edition = last + 1)
- pre-builds image info in `dalle/*`

```
build
|-dalle/
  |-*.json
```

### Download Image

`npm run download_dalle`

Result:
- downloads Dalle image based on `dalle/[last-edition].json` 
- builds meta `json/*` based on `dalle/[last-edition].json`

```
build
|-images/
  |-*.png
|-json/
  |-*.json
```

### Upload Image

`npm run upload_files --start=N --end=N`

Result:
- uploads image to IPFS
- updates "file_url" in `json/*` 

### Upload Meta

`npm run upload_metadata --start=N --end=N`

Result:
- uploads json file to IPFS
- creates `jsonMetas` with all the info ready to mint (ipfs to images and meta files urls added)
```
build
|-jsonMetas/
```

### Mint  <-- Env dependent things
`npm run mint --start=N --end=N`

### CheckTransactions
`npm run check_txns --dir=minted`
