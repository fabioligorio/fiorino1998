// Let the SDK obtain and refresh Vercel's OIDC token automatically.
export function connectedBlob(sdk,env=process.env){
  const storeId=env.BLOB_STORE_ID||env.BLOB_READ_WRITE_TOKEN_STORE_ID;
  if(!storeId&&!env.BLOB_READ_WRITE_TOKEN)throw new Error('Armazenamento não configurado');
  if(!storeId)return sdk;
  return {...sdk,
    head:(path,options)=>sdk.head(path,{...options,storeId}),
    get:(path,options)=>sdk.get(path,{...options,storeId}),
    put:(path,body,options)=>sdk.put(path,body,{...options,storeId})
  };
}
