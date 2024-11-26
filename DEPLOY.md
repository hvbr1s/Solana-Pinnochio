#### To build the program
```
cargo build-bpf
```
#### To set Solana CLI to use the devnet
```
solana config set --url https://api.devnet.solana.com
```
#### To deploy the program
```
solana program deploy ./target/deploy/challengo.so
```

#### To check the deployed program on devnet:
```
solana program show CgHdZ6PbvWftcxrPSn1dU25Ux82JtqHUhtLnGc9tmuHX
```

#### To set the repository remote
```
git remote set-url origin https://github.com/danjaheny/challengo.git
```