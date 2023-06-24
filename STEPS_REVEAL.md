### Reveal

MANUAL 
- if **start** set it will check only what you want ONCE

- `npm run reveal_custom --start=1 --end=2`

AUTO
- if not set it will repeat with interval
- `npm run reveal_custom`



Result:
- reveals nad save info to build/revealed/*.json

### CheckTransactions (can run manual check but it happens in reveal process as well)
`npm run check_revealed_txns --dir=revealed --start=1 --end=2`


## Important _IDEALLY_ to use 1 service to reveal or SYNC files on all services (local/remote)
to track revealed files
otherwise it can try to reveal (update meta) again
which should not break but creates redundant requests
with big collection it is even more important
