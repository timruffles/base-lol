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

// emojis are all non-BMP, and share same first element when encoded
// as utf8
const emojiLowElement = 55357;

export function decodeString(emojiString) {
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

export function encodeUInt8Array(ints) {
    return ints.map(encode).join('');
}

export function encodeString(s) {
    return s.split("").map(s => encode(s.charCodeAt(0))).join('');
}

export function encode(byte) {
  if(byte < 65) {
    return String.fromCodePoint(byte + lowStart);
  } if (byte >= 128) {
    return String.fromCodePoint(byte + highStart - 128);
  } else {
    // ascii printable
    return String.fromCodePoint(asciiTextStart + byte - 65);
  }
}

export function encodeTo(byte) {
    if(byte < 65) {
        return String.fromCodePoint(byte + lowStart);
    } if (byte >= 128) {
        return String.fromCodePoint(byte + highStart - 128);
    } else {
        // ascii printable
        return String.fromCodePoint(asciiTextStart + byte - 65);
    }
}

export function decode(codePoint) {
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
