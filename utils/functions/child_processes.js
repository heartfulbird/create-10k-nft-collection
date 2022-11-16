require('dotenv').config();
const {exec} = require('child_process');

function run_next_command (command) {
  console.log('');
  console.log(`NEXT COMMAND: ${command}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    console.log(`stdout:\n${stdout}`);
  });
}

module.exports = { run_next_command };
