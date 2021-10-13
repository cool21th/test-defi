# test-defi

프로젝트 작업할 신규 디렉토리 생성

> npm init
> npm install --save-dev hardhat




hardhat을 통해 프로젝트 생성진행
> npx hardhat

아래 설치 내용이 없으면, 개인적으로 설치를 진행해야 한다. 

> npm install --save-dev @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers ethers

hardhat 이 디렉토리에 설치가 되면, npx hardhat을 통해 실행할 수 있다.

> npx hardhat accounts

설치가 확인하고, contract 컴파일(contract/Greeter.sol)

> npx hardhat compile
> npx hardhat test
> npx hardhat run scripts/sample-script.js


Connecting a wallet or Dapp to Hardhat Network

> npx hardhat node
> npx hardhat run scripts/sample-script.js --network localhost
