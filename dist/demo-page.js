(function () {
    'use strict';

    (function(l){function m(b){b=void 0===b?"utf-8":b;if("utf-8"!==b)throw new RangeError("Failed to construct 'TextEncoder': The encoding label provided ('"+b+"') is invalid.");}function k(b,a){b=void 0===b?"utf-8":b;a=void 0===a?{fatal:!1}:a;if("utf-8"!==b)throw new RangeError("Failed to construct 'TextDecoder': The encoding label provided ('"+b+"') is invalid.");if(a.fatal)throw Error("Failed to construct 'TextDecoder': the 'fatal' option is unsupported.");}if(l.TextEncoder&&l.TextDecoder)return !1;
    Object.defineProperty(m.prototype,"encoding",{value:"utf-8"});m.prototype.encode=function(b,a){a=void 0===a?{stream:!1}:a;if(a.stream)throw Error("Failed to encode: the 'stream' option is unsupported.");a=0;for(var h=b.length,f=0,c=Math.max(32,h+(h>>1)+7),e=new Uint8Array(c>>3<<3);a<h;){var d=b.charCodeAt(a++);if(55296<=d&&56319>=d){if(a<h){var g=b.charCodeAt(a);56320===(g&64512)&&(++a,d=((d&1023)<<10)+(g&1023)+65536);}if(55296<=d&&56319>=d)continue}f+4>e.length&&(c+=8,c*=1+a/b.length*2,c=c>>3<<3,
    g=new Uint8Array(c),g.set(e),e=g);if(0===(d&4294967168))e[f++]=d;else{if(0===(d&4294965248))e[f++]=d>>6&31|192;else if(0===(d&4294901760))e[f++]=d>>12&15|224,e[f++]=d>>6&63|128;else if(0===(d&4292870144))e[f++]=d>>18&7|240,e[f++]=d>>12&63|128,e[f++]=d>>6&63|128;else continue;e[f++]=d&63|128;}}return e.slice(0,f)};Object.defineProperty(k.prototype,"encoding",{value:"utf-8"});Object.defineProperty(k.prototype,"fatal",{value:!1});Object.defineProperty(k.prototype,"ignoreBOM",{value:!1});k.prototype.decode=
    function(b,a){a=void 0===a?{stream:!1}:a;if(a.stream)throw Error("Failed to decode: the 'stream' option is unsupported.");b=new Uint8Array(b);a=0;for(var h=b.length,f=[];a<h;){var c=b[a++];if(0===c)break;if(0===(c&128))f.push(c);else if(192===(c&224)){var e=b[a++]&63;f.push((c&31)<<6|e);}else if(224===(c&240)){e=b[a++]&63;var d=b[a++]&63;f.push((c&31)<<12|e<<6|d);}else if(240===(c&248)){e=b[a++]&63;d=b[a++]&63;var g=b[a++]&63;c=(c&7)<<18|e<<12|d<<6|g;65535<c&&(c-=65536,f.push(c>>>10&1023|55296),c=56320|
    c&1023);f.push(c);}}return String.fromCharCode.apply(null,f)};l.TextEncoder=m;l.TextDecoder=k;})("undefined"!==typeof window?window:"undefined"!==typeof global?global:undefined);

    /**
     * Encodes binary data as emojis in utf8.
     */

    // use the most recognisable emojis for ascii/utf8 text
    var asciiTextStart = "😀".codePointAt(0);
    var asciiTextEnd = asciiTextStart + 128;

    // 256 char run after rat
    var lowStart = "🐀".codePointAt(0);
    var lowEnd = lowStart + 64;
    var highStart = lowEnd + 1;
    var highEnd = highStart + 127;

    // emojis are all non-BMP, and share same first element when encoded
    // as utf8
    var emojiLowElement = 55357;

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
            throw Error("character out of range '" + codePoint + "'");
        }
    }

    function decodeString(emojiString) {
        var bytes = new Array(emojiString.length / 2);
        for (var i = 0; i < emojiString.length; i += 2) {
            if (emojiString.charCodeAt(i) !== emojiLowElement) {
                throw Error("failed to decode string at index " + i + ": '" + emojiString.slice(i, i + 2) + "'");
            }
            var codePoint = emojiString.codePointAt(i);
            bytes[i / 2] = decode(codePoint);
        }
        return bytes;
    }

    function encodeString(s) {
        return s.split("").map(function (s) {
            return encode(s.charCodeAt(0));
        }).join('');
    }

    var toConsumableArray = function (arr) {
      if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

        return arr2;
      } else {
        return Array.from(arr);
      }
    };

    var BYTES_PREVIEW = 4;
    var EMOJI_PER_BYTE = 4;
    // two JS chars per emoji
    var CHARACTERS_PER_EMOJI = 2;

    var state = {
        shownMobileWarning: false
    };

    document.addEventListener('DOMContentLoaded', main);

    function main() {
        // exposed for console-based fun
        window.baseLol = {
            encode: encode,
            decode: decode,
            decodeString: decodeString,
            encodeString: encodeString
        };

        if (!assertBrowserSupport()) return;

        addDragListeners();
        addFileListeners();
    }

    function assertBrowserSupport() {
        if (typeof FileReader === 'undefined') {
            alert("Sorry - this was a on-the-tube hack, HTML5 browsers only :)");
            return false;
        }

        return true;
    }

    function addDragListeners() {
        arrayFrom(document.querySelectorAll('.uploadBlock')).forEach(function (el) {
            var action = el.dataset.action;

            el.addEventListener('dragover', function (e) {
                e.preventDefault();
                el.classList.add('dragover');
            });

            el.addEventListener('dragleave', function (e) {
                el.classList.remove('dragover');
            });

            el.addEventListener('dragstart', function (e) {
                e.preventDefault();
                ev.dataTransfer.dropEffect = 'upload';
            });

            el.addEventListener('drop', function (e) {
                e.preventDefault();
                el.classList.remove('dragover');

                var files = [].concat(toConsumableArray(event.dataTransfer.files));
                var handler = action === 'encode' ? encodeFiles : decodeFiles;

                handler(files);
            });
        });

        // not pleasant to replace the page
        document.body.addEventListener('dragover', function (e) {
            e.preventDefault();
        });
        document.body.addEventListener('drop', function (e) {
            e.preventDefault();
        });
    }

    function encodeFiles(files) {
        arrayFrom(files).forEach(function (file, index) {
            var reader = new FileReader();
            reader.addEventListener("loadend", function () {
                var bytes = new Uint8Array(reader.result);
                var encoded = '';
                for (var i = 0; i < bytes.length; i++) {
                    encoded += encode(bytes[i]);
                }
                var filename = file.name.replace(/(\.[^\.]+)?$/, '$1.base-lol');

                if (index === 0) {
                    preview([].slice.call(bytes, 0, BYTES_PREVIEW), encoded.slice(0, BYTES_PREVIEW * EMOJI_PER_BYTE * CHARACTERS_PER_EMOJI));
                }

                download(filename, new File([encoded], filename));
            });
            reader.readAsArrayBuffer(file);
        });
    }

    function preview(bytes, emoji) {
        var status = document.querySelector('.status');
        status.classList.remove('hidden');
        var bytesAsString = bytes.map(function (i) {
            return '0x' + i.toString(16);
        }).join(' ');
        status.querySelector('.bytePreview').innerHTML = bytesAsString;
        status.querySelector('.previewCount').innerHTML = BYTES_PREVIEW;
        status.querySelector('.preview').innerHTML = emoji;
    }

    function decodeFiles(files) {
        arrayFrom(files).forEach(function (file) {
            var reader = new FileReader();
            reader.addEventListener("loadend", function () {
                var input = new Uint8Array(reader.result);
                var emojiString = new TextDecoder('utf-8').decode(input);
                var output = new ArrayBuffer(input.byteLength / 4);
                var outputView = new DataView(output);
                for (var i = 0; i < emojiString.length; i += 2) {
                    var codePoint = emojiString.codePointAt(i);
                    outputView.setUint8(i / 2, decode(codePoint));
                }
                var filename = file.name.replace(/(\.[^\.]+)?\.base-lol$/, '.decoded$1');

                download(filename, new File([output], filename));
            });
            reader.readAsArrayBuffer(file);
        });
    }

    function addFileListeners() {
        arrayFrom(document.querySelectorAll('.uploadBlock input[type=file]')).forEach(function (el) {
            el.addEventListener('change', function (e) {
                var files = [].concat(toConsumableArray(event.target.files));
                var isEncode = e.target.closest('[data-action]').dataset.action === 'encode';
                var handler = isEncode ? encodeFiles : decodeFiles;

                handler(files);
            });
        });
    }

    function download(filename, data) {
        showDeviceDownloadInstructions();

        var element = document.createElement('a');
        var url = URL.createObjectURL(data);
        element.setAttribute('href', url);
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();
        document.body.removeChild(element);

        URL.revokeObjectURL(url);
    }

    function arrayFrom(xs) {
        return [].slice.call(xs);
    }

    function showDeviceDownloadInstructions() {
        if (isMobile() && !state.shownMobileWarning) {
            alert('Save the blob to Files, and you can reupload it.');
        }
    }

    function isMobile() {
        return (/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(navigator.userAgent)
        );
    }

}());
