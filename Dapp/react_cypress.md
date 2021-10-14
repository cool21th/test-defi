
> Quick start
>
> npx create-react-app my-app

> Another start
> 
> npm init react-app my-app
> yarn create react-app my-app


Typescript
> npx create-react-app my-app --template typescript


selecting package manager

> npx create-react-app my-app --use-npm



cypress, babel, cosmos , graphql, linqui

davavat, ethersproject, gnosis.pm, popperjs

typechain, 

[cypress](

> npx create-react-app my-app --template typescript
> yarn add -D cypress eslint-plugin-cypress cypress-react-selector
> npm install --save-dev @babel/core @babel/cli @babel/preset-env
> yarn add --dev react-cosmos

[web3-react](https://www.npmjs.com/package/web3-react)

> yarn add ethers
> yarn add web3
> yarn add web3-react@unstable


[GraphQL](github.com/graphql/graphql-js]

graphql-codegen은 로컬 디렉토리에서만 설치 디펜던시 문제 생길수 있음


> yarn add graphql
> yarn add -D @graphql-codegen/cli
> yarn graphql-codegen init
> yarn add -D @graphql-codegen/typescript 

codegen 생성
> yarn generate

Codegen.yml 파일생성
> yarn graphql-codegen --config ./path/to/config.yml

[lingui](https://lingui.js.org/tutorials/setup-cra.html)

> yarn add --dev @lingui/cli @lingui/macro
> yarn add @lingui/react
> check : yarn extract


[ethersproject](https://docs.ethers.io/v5/)

Ther ethers.js library aims to be a complete and compact library for interacting with the Ethereum Blockchain and its ecosystem. It was originally designed for use with ethers.io and has since expanded into a more general-purpose library.


The contract object makes it easier to use an on-chain Contract as a normal JavaScript object, with the methods mapped to encoding and decoding data for you

> npm install --save ethers

보안에 반드시 필요(React Native 사용시)
> npm install @ethersproject/shims --save

```javascript
import "@ethersproject/shims" // Pull.  in the shims (Before importing ethers)

import {ethers} from "ethers"; // Import the ethers libraray

```

security

The React Native environment does not contain a secure random source, which is used when computing random private keys.
this could result in privates keys that others could possibly guess, allowing funds to be stolen and assets manipulated.

```javascript

import "react-native-get-random-values";
import "@ethersproject/shims"
import {ethers} from "ethers";

```


[gnosis](https://docs.gnosis.io/safe/docs/sdks_safe_apps/)

It's essential for the dapp ecosystem to access the untapped market of multi-signature wallet.

> yarn add @gnosis.pm/safe-apps-web3-react

[popperjs](https://popper.js.org/)

Tooltip

[typechain](https://github.com/dethcrypto/TypeChain)

TypeChain is a code generator - provide ABI file and name of your blockchain access library (ethers/truffle/web3.js) and you will get TypeScript typings compatible with a given library

```javascript
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
