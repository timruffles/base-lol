# base-lol(1)

Encodes/decodes binary data as a sequence of emojis.

## Efficiency

Encodes every byte as an emoji in utf8, so 32 bits! 25% efficient.

## Demo

Requires node >= 10.

Binary file

    node base-lol.mjs < targets/max.jpg > max.base-lol
    node base-lol.mjs --decode < max.base-lol > max-decoded.jpg
    diff targets/max.jpg max-decoded.jpg

Something readable:

    ƒ cat targets/smiley.svg
    <svg xmlns="http://www.w3.org/2000/svg"><circle fill="#FF0" cx="6" cy="6" r="6"/><circle cx="3" cy="4" r="1"/><circle cx="7" cy="4" r="1"/><path d="M2,6 C2,6 3,12 8,6"/></svg>
    ƒ node dist/base-lol.js < targets/smiley.svg
    🐼😲😵😦🐠😷😬😫😭😲🐽🐢😧😳😳😯🐺🐯🐯😶😶😶🐮😶🐳🐮😮😱😦🐯🐲🐰🐰🐰🐯😲😵😦🐢🐾🐼😢😨😱😢😫😤🐠😥😨😫😫🐽🐢🐣😅😅🐰🐢🐠😢😷🐽🐢🐶🐢🐠😢😸🐽🐢🐶🐢🐠😱🐽🐢🐶🐢🐯🐾🐼😢😨😱😢😫😤🐠😢😷🐽🐢🐳🐢🐠😢😸🐽🐢🐴🐢🐠😱🐽🐢🐱🐢🐯🐾🐼😢😨😱😢😫😤🐠😢😷🐽🐢🐷🐢🐠😢😸🐽🐢🐴🐢🐠😱🐽🐢🐱🐢🐯🐾🐼😯😠😳😧🐠😣🐽🐢😌🐲🐬🐶🐠😂🐲🐬🐶🐠🐳🐬🐱🐲🐠🐸🐬🐶🐢🐯🐾🐼🐯😲😵😦🐾
    ƒ node dist/base-lol.js < targets/smiley.svg | node dist/base-lol.js --decode
    <svg xmlns="http://www.w3.org/2000/svg"><circle fill="#FF0" cx="6" cy="6" r="6"/><circle cx="3" cy="4" r="1"/><circle cx="7" cy="4" r="1"/><path d="M2,6 C2,6 3,12 8,6"/></svg>

