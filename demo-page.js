import './node_modules/fast-text-encoding/text.min.js';
import { encode, decode, decodeString, encodeString } from './base-lol.mjs';

const BYTES_PREVIEW = 4;
const EMOJI_PER_BYTE = 4;
// two JS chars per emoji
const CHARACTERS_PER_EMOJI = 2;

document.addEventListener('DOMContentLoaded', main);

function main() {
    // exposed for console-based fun
    window.baseLol = {
        encode,
        decode,
        decodeString,
        encodeString,
    };

    if(!assertBrowserSupport()) return;

    addDragListeners();
    addFileListeners();
}

function assertBrowserSupport() {
    if(typeof FileReader === 'undefined') {
        alert("Sorry - this was a on-the-tube hack, HTML5 browsers only :)");
        return false;
    }


    return true;
}

function addDragListeners() {
    arrayFrom(document.querySelectorAll('.uploadBlock')).forEach(el => {
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
        })
    });

    // not pleasant to replace the page
    document.body.addEventListener('dragover', e => {
        e.preventDefault();
    });
    document.body.addEventListener('drop', e => {
        e.preventDefault();
    })
}


function encodeFiles(files) {
    arrayFrom(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.addEventListener("loadend", () => {
            const bytes = new Uint8Array(reader.result);
            let encoded = '';
            for(let i = 0; i < bytes.length; i++) {
               encoded += encode(bytes[i]);
            }
            const filename = file.name.replace(/(\.[^\.]+)?$/,
                '$1.base-lol');

            if(index === 0) {
                preview(
                    [].slice.call(bytes, 0, BYTES_PREVIEW),
                    encoded.slice(0, BYTES_PREVIEW * EMOJI_PER_BYTE * CHARACTERS_PER_EMOJI)
                );
            }

            download(filename, new File([encoded], filename));
        });
        reader.readAsArrayBuffer(file);
    });
}

function preview(bytes, emoji) {
    const status = document.querySelector('.status');
    status.classList.remove('hidden');
    const bytesAsString = bytes.map(i => `0x${i.toString(16)}`).join(' ');
    status.querySelector('.bytePreview').innerHTML = bytesAsString;
    status.querySelector('.previewCount').innerHTML = BYTES_PREVIEW;
    status.querySelector('.preview').innerHTML = emoji;
}

function decodeFiles(files) {
    arrayFrom(files).forEach(file => {
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

            download(filename, new File([output], filename));
        });
        reader.readAsArrayBuffer(file);
    });
}

function addFileListeners() {
    arrayFrom(document.querySelectorAll('.uploadBlock input[type=file]')).forEach(el => {
        el.addEventListener('change', e => {
            const files = [...event.target.files];
            const isEncode = e.target
                    .closest('[data-action]').dataset.action
                === 'encode';
            const handler = isEncode
                ? encodeFiles
                : decodeFiles;

            handler(files);
        });

    });
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

function arrayFrom(xs) {
    return [].slice.call(xs);
}
