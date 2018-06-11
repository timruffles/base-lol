import { rollup } from 'rollup';
import babel from 'rollup-plugin-babel';

export default {
    entry: 'base-lol-node.mjs',
    output: {
        file: 'dist/base-lol.js',
        format: 'cjs',
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ]
};
