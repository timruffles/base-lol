import stream from 'stream';
import util from 'util';
import fs from 'fs';
import { encode, decode } from './base-lol';

const pipeline = util.promisify(stream.pipeline);

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

const main = () => {
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
};

main();
