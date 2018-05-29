'use strict';

import { encode } from './base-lol.mjs';

// wait for document to be completed
document.addEventListener('DOMContentLoaded', main);

function main() {
    if(!assertBrowserSupport()) return;

    addDragListeners();
}

function assertBrowserSupport() {
    try {
        eval('`hello`');
    } catch(e) {
        alert("Sorry - this was a on-the-tube hack, ES2015+ browsers only :)");
        return false;
    }

    if(!('ondrag' in document.body)) {
        alert("Sorry - this was a on-the-tube hack, HTML5-enabled browsers only :)");
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

            console.log(files);

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


async function encodeFiles(files) {
    for(const file of files) {
        const reader = new FileReader();
        reader.addEventListener("loadend", () => {
            let encoded = '';
            for(let i = 0; i < reader.result.length; i++) {
               encoded += encode(reader.result[i]);
            }
            const filename = file.name.replace(/(\.[^\.])?$/,
                '.base-lol');

            download(filename, encoded);
        });
        reader.readAsArrayBuffer(file);
    }
}

function decodeFiles(files) {

}

function download(filename, data) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8;' + data);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
}
