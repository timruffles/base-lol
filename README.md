# base-🙃(1)

Encodes/decodes arbitrary binary data as a sequence of emojis.

## Usage

CLI

    > npm install -g base-🙃
    > base-🙃 < targets/max.png > cat.png.base🙃
    > head -cn 2 cat.png.base🙃
    🎉🙃
    > base-🙃 < cat.png.base🙃 > cat-decoded.png
    > diff cat.png cat-decoded.png
    > echo $?
    0

Browser

    import { Base

    

## Efficiency

Encodes every byte as an emoji in utf8, so 32 bits! 25% efficent.

## Demo

    node base-lol.js < targets/max.jpg > max.base-lol
    node base-lol.js --decode < max.base-lol > max-decoded.jpg
    diff targets/max.jpg max-decoded.jpg
