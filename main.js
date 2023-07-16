// Add imports here
const BIP39 = require("bip39")
// Generate a random mnemonic (uses crypto.randomBytes under the hood), defaults to 128-bits of entropy
function generateMnemonic(){
    return BIP39.generateMnemonic()
}
const hdkey = require('ethereumjs-wallet/hdkey')
const Wallet = require('ethereumjs-wallet')
const keccak256 = require('js-sha3').keccak256;
const { FeeMarketEIP1559Transaction, Transaction } = require("@ethereumjs/tx");
const { Chain, Hardfork, Common } = require("@ethereumjs/common");
const { bigIntToHex } = require("@ethereumjs/util");

// Add functions here
function generateSeed(mnemonic){
    return BIP39.mnemonicToSeed(mnemonic)
}

function generatePrivKey(mnemonic){
    const seed = generateSeed(mnemonic)
    return hdkey.fromMasterSeed(seed).derivePath(`m/44'/60'/0'/0/0`).getWallet().getPrivateKey()
}

function derivePubKey(privKey){
    const wallet = Wallet.fromPrivateKey(privKey)    
    return wallet.getPublicKey()
}

function deriveEthAddress(pubKey){
    const address = keccak256(pubKey) // keccak256 hash of  publicKey
    // Get the last 20 bytes of the public key
    return "0x" + address.substring(address.length - 40, address.length)    
}

function signLegacyTx(privKey, txData){  
    const txParams = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.Istanbul })
    const tx = Transaction.fromTxData(txData, { txParams })
    return tx.sign(privKey)
}

function signEIP1559Tx(privKey, txData){  
    const txOptions = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.London })
    const tx = FeeMarketEIP1559Transaction.fromTxData(txData, { txOptions })
    return tx.sign(privKey)
}

function getSignerAddress(signedTx){
    return "0x" + signedTx.getSenderAddress().toString('hex')
}
/*

Do not edit code below this line.

*/

var mnemonicVue = new Vue({
    el:"#app",
    data: {  
        mnemonic: "",
        privKey: "",
        pubKey: "",
        ETHaddress: "",
        sampleLegacyTransaction: {
            nonce: '0x00',
            gasPrice: '0x09184e72a000', 
            gasLimit: '0x2710',
            to: '0x31c1c0fec59ceb9cbe6ec474c31c1dc5b66555b6', 
            value: '0x10', 
            data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
            chainId: 3
        },
        sampleEIP1559Transaction: {
            nonce: '0x00',
            type: 2,
            maxPriorityFeePerGas: '0x09184e72a000',
            maxFeePerGas: '0x09184e72a000',
            gasLimit: '0x2710',
            to: '0x31c1c0fec59ceb9cbe6ec474c31c1dc5b66555b6', 
            value: '0x10', 
            data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
            chainId: 3
        },
        signedLegacySample: {},
        signedEIP1559Sample: {},
        recoveredLegacyAddress: "",
        recoveredEIP1559Address: ""
    },
    methods:{
        getHex: function(val){
            return bigIntToHex(val);
        },
        generateNew: function(){
            this.mnemonic = generateMnemonic()
        },
        signSampleLegacyTx: function(){
            this.signedLegacySample = signLegacyTx(this.privKey, this.sampleLegacyTransaction);
        },
        signSampleEIP1559Tx: function(){
            this.signedEIP1559Sample = signEIP1559Tx(this.privKey, this.sampleEIP1559Transaction);
        }
    },
    watch: {
        mnemonic: function(val){
            this.privKey = generatePrivKey(val)
        },
        privKey: function(val){
            this.pubKey = derivePubKey(val)
        },
        pubKey: function(val){
            this.ETHaddress = deriveEthAddress(val)
            this.recoveredAddress = ""
        },
        signedLegacySample: function(val){
            this.recoveredLegacyAddress = getSignerAddress(val)
        },
        signedEIP1559Sample: function(val){
            this.recoveredEIP1559Address = getSignerAddress(val)
        }
    }
})