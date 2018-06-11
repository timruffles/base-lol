import { encode, decode, decodeString, encodeString } from './base-lol.mjs';

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
        })
    }

    // not pleasant to replace the page
    document.body.addEventListener('dragover', e => {
        e.preventDefault();
    });
    document.body.addEventListener('drop', e => {
        e.preventDefault();
    })
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
