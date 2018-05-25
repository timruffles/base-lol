'use strict';
'use lol';

const package = require("./package.json");
const table = require("./table");

const asciiTextStart = "😀".codePointAt(0);
// 256 char run after rat
const lowStart = "🐀".codePointAt(0);
const highStart = lowStart + 65;

if(require.main === module) {
  main()
    .catch(error => {
        console.error(`base-🙃 went 💣: ${error.stack}`);
      });
}


export async function main() {
  // if help
  if(needsHelp()) {
    return help();
  }

  if(hasFlag('version')) {
    return console.log(package.version);
  }

  const maybeFlag = process.argv[2];
  const inputStream = (() => {
    switch(maybeFlag) {
      case 'encode':
        return encodeStream();
      case 'decode':
        return encodeStream();
      default:
        return detectStream();
    }
  })();

  return inputStream.pipe(process.stdout);
}

function needsHelp() {
  return hasFlag('help');
}

function hasFlag(flag) {
  const asOption = `--${flag}`;
  return Boolean(process.argv.find(f => f === asOption));
}

function help() {
`usage: base-🙃 [encode|decode] --help --version

base-🙃 reads from STDIN and writes to STDOUT. If you
don't specify encode or decode it'll make its best guess
using a machine-learning tuned algorithm[1]

[1] is there a NULL byte in the first 8kb of input?
`
}

function encodeStream() {
}

function decodeStream() {
}

function detectStream() {
}

function byteToEmoji(bite) {
  return 
}

function convert(bite) {
  if(bite < 65) {
    return bite + lowStart; 
  } if (bite >= 128) {
    return bite + highStart;
  } else {
    return asciiTextStart + (bite - 65);
  }
}
