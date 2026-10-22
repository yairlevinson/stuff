import {readFile,writeFile,mkdir} from 'node:fs/promises';
const [html,css,content,core,app,research]=await Promise.all(['index.html','style.css','content.js','core.js','app.js','research.md'].map(p=>readFile(new URL(p,import.meta.url),'utf8')));
const js=[content,core,app.replace(/^import .*;\n/gm,'')].join('\n').replace(/^export /gm,'').replace("href=\"/research.md\"",'href="data:text/plain;charset=utf-8,'+encodeURIComponent(research)+'"');
const standalone=html.replace('<link rel="stylesheet" href="/style.css">','<style>'+css+'</style>').replace('<script type="module" src="/app.js"></script>','<script type="module">'+js.replace(/<\/script/gi,'<\\/script')+'</script>');
await mkdir(new URL('dist/',import.meta.url),{recursive:true});
await writeFile(new URL('dist/amika.html',import.meta.url),standalone);
console.log('Created dist/amika.html — a self-contained offline website.');
