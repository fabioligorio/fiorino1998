import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {fileStore} from './lib/store.js';
import {createHandler} from './lib/handler.js';
const store=fileStore(fileURLToPath(new URL('./data/',import.meta.url)));
const api=createHandler({getStore:async()=>store,local:true});
const files={'/':['index.html','text/html'],'/app.js':['app.js','text/javascript'],'/style.css':['style.css','text/css']};
http.createServer(async(req,res)=>{const path=new URL(req.url,'http://localhost').pathname;if(path==='/api/items')return api(req,res);const entry=files[path];if(!entry){res.writeHead(404);res.end();return;}try{res.setHeader('Content-Type',entry[1]+'; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(await readFile(new URL('./public/'+entry[0],import.meta.url)));}catch{res.writeHead(500);res.end('Erro ao abrir arquivo');}}).listen(4399,'127.0.0.1',()=>console.log('http://127.0.0.1:4399 — dados em data/items.json'));
