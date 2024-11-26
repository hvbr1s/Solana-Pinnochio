import fs from 'fs';
import * as web3 from '@solana/web3.js';
  import { Buffer } from 'buffer';
  
  async function testRatingProgram(
    connection: web3.Connection,
    programId: web3.PublicKey,
    payer: web3.Keypair
  ) {
    // Create or fetch the program's PDA account
    const [programAccount] = await web3.PublicKey.findProgramAddressSync(
      [Buffer.from('rating')],
      programId
    );
  
    // Create the instruction data (rating from 0-10)
    const rating = 8; 
    const data = Buffer.alloc(8);
    data.writeBigUInt64LE(BigInt(rating));
  
    // Create the transaction
    const transaction = new web3.Transaction().add({
      keys: [
        {
          pubkey: programAccount,
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
  
  // Example usage:
  async function main() {
    const connection = new web3.Connection('https://api.devnet.solana.com', 'confirmed');
    const programId = new web3.PublicKey('CgHdZ6PbvWftcxrPSn1dU25Ux82JtqHUhtLnGc9tmuHX');
    const payer = web3.Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(fs.readFileSync('/Users/danjaheny/.config/solana/id.json', 'utf-8')))
      );
  
    await testRatingProgram(connection, programId, payer);
  }
  
  main().catch(console.error);