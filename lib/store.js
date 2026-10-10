import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {randomUUID,createHash} from 'node:crypto';
import {join} from 'node:path';
import {validate} from './validation.js';
export class Conflict extends Error {}
export const initial=async()=>validate(JSON.parse(await readFile(new URL('../data/initial-items.json',import.meta.url),'utf8')));
const serialize=items=>JSON.stringify({version:1,project:'Fiorino 1998',updatedAt:new Date().toISOString(),items},null,2);
const parse=text=>validate(JSON.parse(text).items);
const digest=text=>createHash('sha256').update(text).digest('hex');
export function fileStore(directory){let queue=Promise.resolve();const path=join(directory,'items.json');async function read(){await mkdir(directory,{recursive:true});try{const text=await readFile(path,'utf8');return {items:parse(text),revision:digest(text),mode:'file'};}catch(error){if(error.code!=='ENOENT')throw error;try{await writeFile(path,serialize(await initial()),{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;}return read();}}
return {read,write(items,revision){const operation=queue.then(async()=>{const old=await read();if(revision!==old.revision)throw new Conflict();await mkdir(join(directory,'backups'),{recursive:true});await writeFile(join(directory,'backups',`${Date.now()}-${randomUUID()}.json`),serialize(old.items),{flag:'wx'});const text=serialize(items),temp=path+'.'+randomUUID()+'.tmp';await writeFile(temp,text);await rename(temp,path);return {items,revision:digest(text),mode:'file'};});queue=operation.catch(()=>{});return operation;}};}
export function blobStore(sdk){
  const pathname='fiorino-1998/items.json';
  async function metadata(){try{return await sdk.head(pathname);}catch(error){if((sdk.BlobNotFoundError && error instanceof sdk.BlobNotFoundError)||error.name==='BlobNotFoundError')return null;throw error;}}
  async function read(){
    for(let attempt=0;attempt<3;attempt++){
      let before=await metadata();
      if(!before){
        try{await sdk.put(pathname,serialize(await initial()),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});}
        catch(error){if(!await metadata())throw error;}
        before=await metadata();
      }
      if(!before?.etag)throw Error('Versão do armazenamento indisponível.');
      const blob=await sdk.get(pathname,{access:'private',useCache:false});
      if(!blob||blob.statusCode!==200||!blob.stream)throw Error('Falha ao ler o arquivo.');
      const items=parse(await new Response(blob.stream).text());
      const after=await metadata();
      // Download headers can differ from the storage API's conditional-write ETag.
      // Bracket the consistent content read with metadata to catch concurrent writes.
      if(before.etag===after?.etag)return {items,revision:after.etag,mode:'blob'};
    }
    throw new Conflict();
  }
  return {read,async write(items,revision){
    const old=await read();if(revision!==old.revision)throw new Conflict();
    await sdk.put('fiorino-1998/backups/'+Date.now()+'-'+randomUUID()+'.json',serialize(old.items),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});
    try{const result=await sdk.put(pathname,serialize(items),{access:'private',addRandomSuffix:false,allowOverwrite:true,ifMatch:old.revision,contentType:'application/json'});return {items,revision:result.etag,mode:'blob'};}
    catch(error){if((sdk.BlobPreconditionFailedError && error instanceof sdk.BlobPreconditionFailedError)||error.name==='BlobPreconditionFailedError')throw new Conflict();throw error;}
  }};
}
