// Prepares log files on new server
// RUN:
// npm run forever_prepare

require('dotenv').config();

const fs = require("fs");

const dir = `/Users/stan/.forever`; // TODO: absolute path

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}

if (!fs.existsSync(`${dir}/logs`)) {
  fs.mkdirSync(`${dir}/logs`)
}

fs.writeFileSync(`${dir}/logs/forever.log`, 'first line');
fs.writeFileSync(`${dir}/logs/out.log`, 'first line');
fs.writeFileSync(`${dir}/logs/error.log`, 'first line');

