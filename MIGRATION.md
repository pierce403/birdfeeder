# Birdfeeder on Workers

Original root verification, favicon/static paths and faucet frontend remain.
Frontend ethers6 reads wallet-provider state without requesting connection or
signing. No default third-party RPC key is introduced. Missing-wallet/chain/RPC
states show a clear message. The faucet contract, original signer identity, chain1,
one-percent balance amount,140000 gas and20gwei legacy transaction remain.

The existing Twitter OAuth1 identity verifies users and reads their latest tweet.
Twitter IDs remain decimal strings. Follower threshold100 and destination parsing
remain. Output is escaped and credentials/provider errors never appear in logs.
No funded payout or live Twitter validation has been executed.

A single signer Durable Object serializes submissions. It checks existing paid
status, journals the exact signed transaction before broadcast and reuses that
transaction after an uncertain failure. Duplicate Twitter identities retain one
destination. A chain or signer mismatch rejects the request. RPC must use HTTPS
and credentials stay on that fixed endpoint. The journal is sensitive recovery data.

READ_ONLY and PAYOUTS_ENABLED guard both Worker and Durable Object. Production
starts paused and HEAD cannot trigger payouts. Staging has an independent namespace,
mock RPC and Twitter calls, with a public fixture key and no production secrets.
The legacy /lol external SSH demonstration returns explicit503; it requires a
separate compatibility/scope decision and has not been exercised.

Native main builds use npm ci, npm run build and npx wrangler deploy --env "".
Previews remain disabled. Original master/Heroku recovery is retained. After any
accepted Cloudflare payout, freeze it and reconcile journal/chain pending state
before restoring the source writer; do not restart competing funded writers.
