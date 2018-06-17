import babel from 'rollup-plugin-babel';

export default {
    entry: 'demo-page.js',
    output: {
        file: 'dist/demo-page.js',
        format: 'iife',
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ],
};
