import { rollup } from 'rollup';
import babel from 'rollup-plugin-babel';

export default {
    entry: 'demo-page.js',
    output: 'dist/demo-page.js',
    format: 'iffe',
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ]
};
