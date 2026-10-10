import {createHandler} from '../lib/handler.js';
import {blobStore} from '../lib/store.js';
import {connectedBlob} from '../lib/blob-connection.js';
let store;
export default createHandler({password:process.env.FIORINO_PASSWORD,getStore:async()=>{
  if(!store)store=blobStore(connectedBlob(await import('@vercel/blob')));
  return store;
}});
