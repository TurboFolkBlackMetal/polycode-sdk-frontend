#!/usr/bin/env bash

rm -rf abis
rm -rf types/ethers-contracts
rm -rf contracts/dev3-tokenizer-library
rm -rf cache

mkdir -p contracts/dev3-tokenizer-library
cp -rf dev3-tokenizer-library/contracts contracts/dev3-tokenizer-library
hardhat compile

cp -rf artifacts/contracts abis
cp -rf artifacts/@openzeppelin abis/@openzeppelin
find abis -name '*.dbg.json' -delete

typechain --target=ethers-v5 'abis/**/*.json'
