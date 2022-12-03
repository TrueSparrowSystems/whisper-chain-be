const { ethers } = require("ethers");

const wmaticContractAddress = '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889';
const erc20ContractAbi = require('./contracts/erc20/abi');

const disperseContractAddress = '0x6F2cAAF4bF579847C7A1947c99BA5b8eFe7f3e6e';
const disperseContractAbi = require('./contracts/disperse/abi');

const PER_COLLECT_PROCEEDS = 0.01;

class ApproveAndDisperse {
  constructor(receiverAddresses, numberOfCollects) {
    const oThis = this;

    oThis.receiverAddresses = receiverAddresses;
    oThis.amountInMatics = numberOfCollects * PER_COLLECT_PROCEEDS;
  }

  async perform() {
    const oThis = this;

    await oThis._approveERC20();

    await oThis._disperse();
  }

  async _approveERC20() {
    const oThis = this;

    console.log('* Sending transaction for approval.');

    const provider = new ethers.providers.InfuraProvider('maticmum');
    const signer = new ethers.Wallet(process.env.TX_SIGNER, provider);
    const erc20Contract = new ethers.Contract(wmaticContractAddress, erc20ContractAbi, signer);
    const approveTx = await erc20Contract.approve(disperseContractAddress, ethers.utils.parseUnits(String(oThis.amountInMatics)));
    const receipt = await approveTx.wait();

    console.log('** Transaction hash for approval:', receipt.transactionHash);
  }

  async _disperse() {
    const oThis = this;

    console.log('* Sending transaction for disperseTokenSimple.');

    const provider = new ethers.providers.InfuraProvider('maticmum');
    const signer = new ethers.Wallet(process.env.TX_SIGNER, provider);
    const disperseContract = new ethers.Contract(disperseContractAddress, disperseContractAbi, signer);


    const disperseTokenSimpleTx = await disperseContract.disperseTokenSimple(wmaticContractAddress, oThis.receiverAddresses,
      ethers.utils.parseUnits(String(PER_COLLECT_PROCEEDS)), {gasLimit: 100000});

    const receipt = await disperseTokenSimpleTx.wait();

    console.log('** Transaction hash for disperseTokenSimple:', receipt.transactionHash);
  }
}

module.exports = ApproveAndDisperse;
