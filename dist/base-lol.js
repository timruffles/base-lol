'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var stream = _interopDefault(require('stream'));
var util = _interopDefault(require('util'));
var fs = _interopDefault(require('fs'));

/**
 * - Always encoded as UTF-8 - as efficient as UTF-16 for non-BMP,
 *   and a good standard
 */

// use the most recognisable emojis for ascii/utf8 text
const asciiTextStart = "😀".codePointAt(0);
const asciiTextEnd = asciiTextStart + 128;

// 256 char run after rat
const lowStart = "🐀".codePointAt(0);
const lowEnd = lowStart + 64;
const highStart = lowEnd + 1;
const highEnd = highStart + 127;

function encode(byte) {
    if (byte < 65) {
        return String.fromCodePoint(byte + lowStart);
    }if (byte >= 128) {
        return String.fromCodePoint(byte + highStart - 128);
    } else {
        // ascii printable
        return String.fromCodePoint(asciiTextStart + byte - 65);
    }
}

function decode(codePoint) {
    if (codePoint >= asciiTextStart && codePoint <= asciiTextEnd) {
        return codePoint - asciiTextStart + 65;
    } else if (codePoint >= lowStart && codePoint <= lowEnd) {
        return codePoint - lowStart;
    } else if (codePoint >= highStart && codePoint <= highEnd) {
        return codePoint - highStart + 128;
    } else {
        throw Error(`character out of range '${codePoint}'`);
    }
}

const pipeline = util.promisify(stream.pipeline);

const binaryToEmoji = new stream.Transform({
    transform(chunk, encoding, callback) {
        const asString = [...chunk.values()].map(encode).join('');
        callback(null, asString);
    }
});

const emojiToBinary = new stream.Transform({
    transform(chunk, encoding, callback) {
        const init = () => {
            this.emoji = {
                buffer: Buffer.alloc(4),
                index: 0
            };
        };

        if (!this.emoji) {
            init();
        }

        // each emoji is 4 bytes
        for (let i = 0; i < chunk.length; i++) {
            this.emoji.buffer[this.emoji.index] = chunk[i];
            this.emoji.index += 1;
            if (this.emoji.index === 4) {
                this.push(Buffer.from([decode(this.emoji.buffer.toString('utf8').codePointAt(0))]));
                init();
            }
        }
        callback();
    }
});

const main = () => {
    const stream$$1 = process.argv.some(f => f === '--decode') ? emojiToBinary : binaryToEmoji;

    pipeline(process.stdin, stream$$1, fs.createWriteStream('/dev/stdout')).catch(e => {
        console.error(e.stack);
        process.exit(1);
    });
};

main();
