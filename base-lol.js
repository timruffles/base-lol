{
    'use strict';

    // slots to aritmetic
    // 0 - 0 = 0 but one slot
    // 10 - 9 = 1 but two slots
    // thus - (N - M ) + 1

    // (Ae - As) + (Be - Bs) = (arithmetic diffs) + (N diffs)
    // so with three ranges, sum of arithmetic diffs + 3.

    const asciiTextStart = "😀".codePointAt(0);
    const asciiTextEnd = asciiTextStart + 128;
    // 256 char run after rat
    const lowStart = "🐀".codePointAt(0);
    const lowEnd = lowStart + 64;
    const highStart = lowEnd + 1;
    const highEnd = highStart + 127;

    // emojis are all non-BMP, and share same first element
    const emojiLowElement = 55357;

    if(typeof module !== 'undefined') {

        const stream = require('stream');
        const util = require('util');
        const pipeline = util.promisify(stream.pipeline);
        const fs = require('fs');

        const binaryToEmoji = new stream.Transform({
          transform(chunk, encoding, callback) {
             const asString = [...chunk
                .values()]
                .map(encode)
                .join('');
             callback(null, asString);
          }
        });

        const emojiToBinary = new stream.Transform({
          transform(chunk, encoding, callback) {
            const init = () => {
                this.emoji = {
                  buffer: Buffer.alloc(4),
                  index: 0,
                };
            };

            if(!this.emoji) {
              init();
            }

            // each emoji is 4 bytes
            for(let i = 0; i < chunk.length; i++) {
              this.emoji.buffer[this.emoji.index] = chunk[i];
              this.emoji.index += 1;
              if(this.emoji.index === 4) {
                this.push(
                    Buffer.from([
                      decode(
                        this.emoji.buffer.toString('utf8').codePointAt(0)
                      )
                    ])
                ); 
                init();
              }
            }
            callback();
          }
        });

        if(require.main === module) {
            const stream = process.argv.some(f => f === '--decode')
                ? emojiToBinary
                : binaryToEmoji;

            pipeline(
               process.stdin,
               stream,
               fs.createWriteStream('/dev/stdout')
            )
                .catch(e => {
                    console.error(e.stack);
                    process.exit(1);
                })
        }
    }


    function test() {
        console.log(encodeString("Hello world"));
        console.log(encodeUInt8Array([0, 20, 245, 255, 17]))
        console.log(encodeUInt8Array(Array.from({length: 256}, (_,i) => i)))

        console.log(roundTrip(encodeUInt8Array, decodeString, [245]));

        console.log(roundTrip(encodeUInt8Array, decodeString, [0, 20, 245, 255, 17]));
    }


    function roundTrip(encoder, decoder, input) {
        console.log(
          diffArrays(decoder(encoder(input)), input)
        )
    }

    function decodeString(emojiString) {
        const bytes = new Array(emojiString.length/2);
        for(let i = 0; i < emojiString.length; i+=2) {
            if(emojiString.charCodeAt(i) !== emojiLowElement) {
                throw Error(`failed to decode string at index ${i}: '${emojiString.slice(i, i+2)}'`);
            }
            const codePoint = emojiString.codePointAt(i);
            bytes[i/2] = decode(codePoint);
        }
        return bytes;
    }

    function decodeArray(emojis) {
        return emojis.map(decode);
    }

    function diffArrays(xs, ys) {
        const diffs = {};
        let failed = false;
        for(const [i,x] of xs.entries()) {
          if(ys[i] !== x) {
              failed = true;
              diffs[i] = {
                  actual: x,
                  expected: ys[i],
              };
          }
        }
        return failed ? diffs : 'equal';
    }


    function encodeUInt8Array(ints) {
        return ints.map(encode).join('');
    }

    function encodeString(s) {
        return s.split("").map(s => encode(s.charCodeAt(0))).join('');
    }

    function encode(bite) {
      if(bite < 65) {
        return String.fromCodePoint(bite + lowStart); 
      } if (bite >= 128) {
        return String.fromCodePoint(bite + highStart - 128);
      } else {
        // ascii printable
        return String.fromCodePoint(asciiTextStart + bite - 65);
      }
    }

    function decode(codePoint) {
        if(codePoint >= asciiTextStart && codePoint <= asciiTextEnd) {
            return codePoint - asciiTextStart + 65;
        } else if(codePoint >= lowStart && codePoint <= lowEnd) {
            return codePoint - lowStart;
        } else if(codePoint >= highStart && codePoint <= highEnd) {
            return codePoint - highStart + 128;
        } else {
            throw Error(`character out of range '${codePoint}'`);
        }
    }
}
