Quick start

npx create-react-app my-app

Another start

npm init react-app my-app yarn create react-app my-app

Typescript

npx create-react-app my-app --template typescript

selecting package manager

npx create-react-app my-app --use-npm

cypress, babel, cosmos , graphql, linqui

davavat, ethersproject, gnosis.pm, popperjs

typechain, ajv , cids, copy-to-clipboard, cross-env, d3

interui, jest-styled-components, luxon, microbundle, ms.macro, multicodec, multihands, node-vibrant

polished, polyfill-object.frometries, qs, rebass, ua-parser-js, use-count-up, wcag-contrast, web-vitals

workbox-core, workbox-precaching, workbox-routing

[cypress](

npx create-react-app my-app --template typescript yarn add -D cypress eslint-plugin-cypress cypress-react-selector npm install --save-dev @babel/core @babel/cli @babel/preset-env yarn add --dev react-cosmos

web3-react

yarn add ethers yarn add web3 yarn add web3-react@unstable

[GraphQL](github.com/graphql/graphql-js]

graphql-codegen은 로컬 디렉토리에서만 설치 디펜던시 문제 생길수 있음

yarn add graphql yarn add -D @graphql-codegen/cli yarn graphql-codegen init yarn add -D @graphql-codegen/typescript

codegen 생성

yarn generate

Codegen.yml 파일생성

yarn graphql-codegen --config ./path/to/config.yml

lingui

yarn add --dev @lingui/cli @lingui/macro yarn add @lingui/react check : yarn extract

ethersproject

Ther ethers.js library aims to be a complete and compact library for interacting with the Ethereum Blockchain and its ecosystem. It was originally designed for use with ethers.io and has since expanded into a more general-purpose library.

The contract object makes it easier to use an on-chain Contract as a normal JavaScript object, with the methods mapped to encoding and decoding data for you

npm install --save ethers

보안에 반드시 필요(React Native 사용시)

npm install @ethersproject/shims --save

import "@ethersproject/shims" // Pull.  in the shims (Before importing ethers)

import {ethers} from "ethers"; // Import the ethers libraray
security

The React Native environment does not contain a secure random source, which is used when computing random private keys. this could result in privates keys that others could possibly guess, allowing funds to be stolen and assets manipulated.

import "react-native-get-random-values";
import "@ethersproject/shims"
import {ethers} from "ethers";
gnosis

It's essential for the dapp ecosystem to access the untapped market of multi-signature wallet.

yarn add @gnosis.pm/safe-apps-web3-react

popperjs

Tooltip

typechain

TypeChain is a code generator - provide ABI file and name of your blockchain access library (ethers/truffle/web3.js) and you will get TypeScript typings compatible with a given library

import { runTypeChain, glob } from 'typechain'

async function main() {
  const cwd = process.cwd()
  // find all files matching the glob
  const allFiles = glob(cwd, [`${config.paths.artifacts}/!(build-info)/**/+([a-zA-Z0-9_]).json`])

  const result = await runTypeChain({
    cwd,
    filesToProcess: allFiles,
    allFiles,
    outDir: 'out directory',
    target: 'target name',
  })
}

main().catch(console.error)

``
> yarn add --dev typechain


[ajv](https://github.com/ajv-validator/ajv)

The fastest JSON validator for Node.js and browser.

[cids](https://github.com/multiformats/js-cid)
This module has been superseded by the multiformats module

> npm install --save cids


interui

more easily distributing the font

> npm install --save inter-ui


polyfills

Create polyfill builds based on the client's browser and serve only what's needed. 
This allows you to write modern Javascript without worrying too much

> npm install polyfills


ua-parser-js

단말기로 로그인한 것인지 PC에서 로그인 한것인지 결정

> npm install --save-dev ua-parser-js
> import * as uaParserJS from 'ua-parser-js';
