import {DurableObject} from 'cloudflare:workers';import {Wallet,Interface,keccak256} from 'ethers';
export const contract='0xD803d7597bd638998BE368aF196DC2c53cAF5B63';export const expectedSigner='0xe6898aFEc66515349De48C7AC90e26D93d128C66';const abi=new Interface(['function dispense(address dst,uint256 sum,uint256 userid)','function paid(uint256) view returns(bool)']);const fixtureKey='0x'+'0'.repeat(63)+'1';
async function rpc(env,method,params){
 if(env.STAGING==='true'){
  if(method==='eth_chainId')return '0x1';if(method==='eth_call')return '0x'+'0'.repeat(64);if(method==='eth_getBalance')return '0xde0b6b3a7640000';if(method==='eth_getTransactionCount')return '0x0';if(method==='eth_getTransactionByHash')return null;if(method==='eth_sendRawTransaction'){if(env.FAIL_BROADCAST==='true')throw new Error('fixture_retry');return keccak256(params[0]);}throw new Error('fixture_method');
 }
 const url=new URL(env.web3);if(url.protocol!=='https:')throw new Error('rpc_unavailable');const headers={'Content-Type':'application/json'};if(url.username||url.password)headers.Authorization='Basic '+btoa(decodeURIComponent(url.username)+':'+decodeURIComponent(url.password));url.username='';url.password='';const r=await fetch(url,{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),redirect:'manual',signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error('rpc_unavailable');const data=await r.json();if(data.error||data.result===undefined)throw new Error('rpc_unavailable');return data.result;
}
export class Faucet extends DurableObject{
 constructor(ctx,env){super(ctx,env);this.queue=Promise.resolve();}
 async fetch(request){const operation=this.queue.then(()=>this.run(request));this.queue=operation.catch(()=>{});return operation;}
 async run(request){
  if(this.env.READ_ONLY==='true'||this.env.PAYOUTS_ENABLED!=='true')return Response.json({error:'Payouts are disabled during migration.'},{status:503});let data;try{data=await request.json();}catch{return Response.json({error:'Invalid payout.'},{status:400});}if(!/^0x[0-9a-fA-F]{40}$/.test(data.address||'')||!/^\d{1,30}$/.test(data.userID||''))return Response.json({error:'Invalid payout.'},{status:400});
  const key='payout:'+data.userID;let entry=await this.ctx.storage.get(key);
  if(entry&&entry.address.toLowerCase()!==data.address.toLowerCase())return Response.json({error:'This Twitter identity already has a payout destination.'},{status:409});
  const active=await this.ctx.storage.get('active-payout');if(entry?.state==='broadcast'){if(active===data.userID)await this.ctx.storage.delete('active-payout');return Response.json({transactionHash:entry.hash,reused:true});}if(active&&active!==data.userID)return Response.json({error:'A previous signer transaction is pending verification.'},{status:503});
  try{
   if(!entry){
    const signer=new Wallet(this.env.STAGING==='true'?fixtureKey:this.env.KEY);if(this.env.STAGING!=='true'&&signer.address!==expectedSigner)throw new Error('signer_identity');if(BigInt(await rpc(this.env,'eth_chainId',[]))!==1n)throw new Error('wrong_chain');const paid=await rpc(this.env,'eth_call',[{to:contract,data:abi.encodeFunctionData('paid',[data.userID])},'latest']);if(abi.decodeFunctionResult('paid',paid)[0])return Response.json({alreadyPaid:true});
    const balance=BigInt(await rpc(this.env,'eth_getBalance',[contract,'latest'])),amount=balance/100n;if(amount<=0n)throw new Error('empty_faucet');const nonce=Number(BigInt(await rpc(this.env,'eth_getTransactionCount',[signer.address,'pending'])));if(!Number.isSafeInteger(nonce))throw new Error('nonce');const raw=await signer.signTransaction({type:0,chainId:1,nonce,to:contract,gasLimit:140000n,gasPrice:20000000000n,data:abi.encodeFunctionData('dispense',[data.address,amount,data.userID])});entry={address:data.address,userID:data.userID,raw,hash:keccak256(raw),state:'pending',createdAt:new Date().toISOString()};await this.ctx.storage.put({[key]:entry,'active-payout':data.userID});
   }
   const known=await rpc(this.env,'eth_getTransactionByHash',[entry.hash]);const result=known?.hash||await rpc(this.env,'eth_sendRawTransaction',[entry.raw]);if(result.toLowerCase()!==entry.hash.toLowerCase())throw new Error('broadcast_mismatch');entry.state='broadcast';await this.ctx.storage.put(key,entry);await this.ctx.storage.delete('active-payout');return Response.json({transactionHash:entry.hash,reused:false});
  }catch{return Response.json({error:entry?'Payout broadcast is pending verification; retry uses the same transaction.':'Payout is currently unavailable.'},{status:503});}
 }
}
