(function () {
  'use strict';

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

  function encodeString(s) {
      return s.split("").map(s => encode(s.charCodeAt(0))).join('');
  }

  function encode(byte) {
    if(byte < 65) {
      return String.fromCodePoint(byte + lowStart);
    } if (byte >= 128) {
      return String.fromCodePoint(byte + highStart - 128);
    } else {
      // ascii printable
      return String.fromCodePoint(asciiTextStart + byte - 65);
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

  document.addEventListener('DOMContentLoaded', main);

  function main() {
      window.baseLol = {
          encode,
          decode,
          decodeString,
          encodeString,
      };

      if(!assertBrowserSupport()) return;

      addDragListeners();
  }

  function assertBrowserSupport() {
      if(typeof TextDecoder === 'undefined' || !('ondrop' in document.body)) {
          alert("Sorry - this was a on-the-tube hack, only Browsers with TextDecoder and drag/drop");
          return false;
      }

      if(typeof Symbol === 'undefined') {
          alert("Sorry - this was a on-the-tube hack, ES2015+ browsers only :)");
          return false;
      }


      return true;
  }

  function addDragListeners() {
      for (const el of document.querySelectorAll('.uploadBlock')) {
          const action = el.dataset.action;

          el.addEventListener('dragover', e => {
              e.preventDefault();
              el.classList.add('dragover');
          });

          el.addEventListener('dragleave', e => {
              el.classList.remove('dragover');
          });

          el.addEventListener('dragstart', e => {
              e.preventDefault();
              ev.dataTransfer.dropEffect = 'upload';
          });

          el.addEventListener('drop', e => {
              e.preventDefault();
              el.classList.remove('dragover');

              const files = [...event.dataTransfer.files];
              const handler = action === 'encode'
                  ? encodeFiles
                  : decodeFiles;

              handler(files);
          });
      }

      // not pleasant to replace the page
      document.body.addEventListener('dragover', e => {
          e.preventDefault();
      });
      document.body.addEventListener('drop', e => {
          e.preventDefault();
      });
  }


  function encodeFiles(files) {
      for(const file of files) {
          const reader = new FileReader();
          reader.addEventListener("loadend", () => {
              const bytes = new Uint8Array(reader.result);
              let encoded = '';
              for(const byte of bytes) {
                 encoded += encode(byte);
              }
              const filename = file.name.replace(/(\.[^\.]+)?$/,
                  '$1.base-lol');

              download(filename, new Blob([encoded]));
          });
          reader.readAsArrayBuffer(file);
      }
  }

  function decodeFiles(files) {
      for(const file of files) {
          const reader = new FileReader();
          reader.addEventListener("loadend", () => {
              const input = new Uint8Array(reader.result);
              const emojiString = new TextDecoder('utf-8').decode(input);
              const output = new ArrayBuffer(input.byteLength/4);
              const outputView = new DataView(output);
              for(let i = 0; i < emojiString.length; i+=2) {
                  const codePoint = emojiString.codePointAt(i);
                  outputView.setUint8(i/2, decode(codePoint));
              }
              const filename = file.name.replace(/(\.[^\.]+)?\.base-lol$/,
                  '.decoded$1');

              download(filename, new Blob([output]));
          });
          reader.readAsArrayBuffer(file);
      }
  }

  function download(filename, data) {
      const element = document.createElement('a');
      const url = URL.createObjectURL(data);
      element.setAttribute('href', url);
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();
      document.body.removeChild(element);

      URL.revokeObjectURL(url);
  }

}());
