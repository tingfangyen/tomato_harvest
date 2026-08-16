const esbuild = require('esbuild');
const fs = require('fs');

esbuild.buildSync({
  entryPoints: ['index.jsx'],
  bundle: true,
  minify: true,
  format: 'iife',
  outfile: 'bundle.js',
});

const bundle = fs.readFileSync('bundle.js', 'utf8');
const template = fs.readFileSync('template.html', 'utf8');
// IMPORTANT: use a function replacer, not a string. A string replacer makes
// JS treat sequences like $` or $' in `bundle` as special replace-patterns,
// which corrupts minified output that happens to contain those characters.
const output = template.replace('/*__BUNDLE__*/', () => bundle);

fs.writeFileSync('tomato_harvest.html', output);
console.log('Built tomato_harvest.html (' + output.length + ' bytes)');
