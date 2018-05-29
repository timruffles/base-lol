# base-lol(1)

Encodes/decodes binary data as a sequence of emojis.

## Efficiency

Encodes every byte as an emoji in utf8, so 32 bits! 25% efficent.

## Demo

    node base-lol.mjs < targets/max.jpg > max.base-lol
    node base-lol.mjs --decode < max.base-lol > max-decoded.jpg
    diff targets/max.jpg max-decoded.jpg
