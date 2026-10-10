import {createHandler} from '../lib/handler.js';
import {blobStore} from '../lib/store.js';
let store;
export default createHandler({password:process.env.FIORINO_PASSWORD,getStore:async()=>{if(!process.env.BLOB_READ_WRITE_TOKEN)throw Error('Armazenamento não configurado');if(!store)store=blobStore(await import('@vercel/blob'));return store;}});
