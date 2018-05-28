'use strict';


// wait for document to be completed
document.addEventListener('DOMContentLoaded', main);

function main() {
    if(!assertBrowserSupport()) return;

    addDragListeners();

    startWorker();
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

            const files = event.dataTransfer.files;
            const handler = action === 'encode'
                ? encodeFiles
                : decodeFiles;

            console.log(files);

            [...files].forEach(handler);
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

function startWorker() {
    window.lolWorker = new Worker('base-lol-worker.js', {
        type:'module',
    });
    window.lolJobs = [];

    window.onmessage = ({taskId, result}) => {
        window.lolJobs[taskId](result);
        window.lolJobs[taskId] = undefined;
    };
}

function microtask(fn) {
    return Promise.resolve().then(fn);
}

function runJob(job) {
    const jobId = window.lolJobs.length;

    microtask(() => {
        window.lolWorker.postMessage(Object.assign({}, job, {
            jobId,
        }));
    });

    return new Promise((resolve, reject) => {
        window.lolJobs[jobId] = ({ error, result }) => {
            if(error) {
                console.error('Error in worker', error);
                reject(new Error(error.message));
            } else {
                resolve(result);
            }
        }
    });
}


function decodeFiles(files) {
}

function encodeFiles(files) {
    runJob({
        type: 'decode',
    })
}

function fileAdded() {

}

function download(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/octet-stream;');
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
}
