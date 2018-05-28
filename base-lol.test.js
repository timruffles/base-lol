'use strict';

const { encodeUInt8Array, decodeString } = require('./base-lol');

const assert = require('assert');

roundTrip(encodeUInt8Array, decodeString, [245]);

roundTrip(encodeUInt8Array, decodeString, [0, 20, 245, 255, 17]);

function roundTrip(encoder, decoder, input) {
    assert.deepEqual(
        decoder(encoder(input)),
        input
    );
}

