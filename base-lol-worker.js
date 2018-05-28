'use strict';

import { encode } from './base-lol';

self.addEventListener('message', ({ data: { type, files} }) => {
    const handler = type === 'encode'
        ? encodeFiles
        : decodeFiles;

    handler(files)
        .then(download)
});

async function encodeFiles(files) {
    for(const file of files) {
        const reader = new FileReader();
        reader.addEventListener("loadend", () => {
            const string = reader.result.map(encode).join('');
            const filename = file.filename.replace(/(\.[^\.])?$/,
                '.base-lol');

            download(filename, data);
        });
        reader.readAsArrayBuffer(file);
    }
}

function decodeFiles(files) {

}

function download(files) {

}

function download(filename, data) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/octet-stream;' + data);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
}
