const {
    Entry,
    isValidFctPublicAddress,
    isValidEcPrivateAddress,
    addressToKey
} = require('factom');
const { getIdentityRootChainEntries, getIdentityKeys, extractServerManagementSubchainId } = require('./get');
const { sha256d } = require('./util');

const base58 = require('base-58');
const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');

async function updateCoinbaseAddress(cli, rootChainId, fctAddress, sk1, ecPrivateAddress) {
    if (!isValidSk1(sk1)) {
        throw new Error('Lowest level identity key (sk1) is not valid');
    }
    if (!isValidFctPublicAddress(fctAddress)) {
        throw new Error(`Invalid public FCT address; ${fctAddress}`);
    }
    if (!isValidEcPrivateAddress(ecPrivateAddress)) {
        throw new Error(`Invalid private EC address ${ecPrivateAddress}`);
    }

    const balance = await cli.getBalance(ecPrivateAddress);
    if (balance < 1) {
        throw new Error('Insufficient EC balance to pay for updating coinbase address');
    }

    const rootEntries = await getIdentityRootChainEntries(cli, rootChainId);
    const identityKey1 = getIdentityKeys(rootEntries[0])[0];

    const identityKey = sha256d(Buffer.concat([Buffer.from('01', 'hex'), privateKeyToPublicKey(extractSecretFromIdentityKey(sk1))]));
    if (!identityKey1.equals(identityKey)) {
        throw new Error(`The SK1 key doesn't cannot sign in the Identity Root Chain ${rootChainId}`);
    }

    const entry = getCoinbaseAddressChangeEntry(rootChainId, fctAddress, sk1);
    return await cli.addEntry(entry, ecPrivateAddress);
}

async function updateEfficiency(cli, rootChainId, efficiency, sk1, ecPrivateAddress) {
    if (typeof efficiency !== 'number' || efficiency < 0 || efficiency > 100) {
        throw new Error('Efficiency must be a number between 0 and 100');
    }
    if (!isValidSk1(sk1)) {
        throw new Error('Lowest level identity key (sk1) is not valid');
    }
    if (!isValidEcPrivateAddress(ecPrivateAddress)) {
        throw new Error(`Invalid private EC address ${ecPrivateAddress}`);
    }

    const balance = await cli.getBalance(ecPrivateAddress);
    if (balance < 1) {
        throw new Error('Insufficient EC balance to pay for updating efficiency');
    }
    const rootEntries = await getIdentityRootChainEntries(cli, rootChainId);
    const identityKey1 = getIdentityKeys(rootEntries[0])[0];

    const identityKey = sha256d(Buffer.concat([Buffer.from('01', 'hex'), privateKeyToPublicKey(extractSecretFromIdentityKey(sk1))]));
    if (!identityKey1.equals(identityKey)) {
        throw new Error(`The SK1 key doesn't cannot sign in the Identity Root Chain ${rootChainId}`);
    }

    const serverManagementSubchainId = extractServerManagementSubchainId(rootEntries);
    const entry = getEfficiencyChangeEntry(rootChainId, serverManagementSubchainId, efficiency, sk1);
    return await cli.addEntry(entry, ecPrivateAddress);
}

//////////////////////////////////////////////

function getCoinbaseAddressChangeEntry(rootChainId, fctAddress, sk1) {
    const version = Buffer.from('00', 'hex');
    const marker = Buffer.from('Coinbase Address', 'utf8');
    const chainId = Buffer.from(rootChainId, 'hex');
    const factoidAddress = addressToKey(fctAddress);
    const timestamp = getTimestampBuffer();

    const dataToSign = Buffer.concat([version, marker, chainId, factoidAddress, timestamp]);
    const { identityKeyPreImage, signature } = signData(sk1, dataToSign);

    return Entry.builder()
        .chainId(chainId)
        .extId(version)
        .extId(marker)
        .extId(chainId)
        .extId(factoidAddress)
        .extId(timestamp)
        .extId(identityKeyPreImage)
        .extId(signature)
        .build();
}

function getEfficiencyChangeEntry(rootChainId, serverManagementSubchainId, eff, sk1) {
    const version = Buffer.from('00', 'hex');
    const marker = Buffer.from('Server Efficiency', 'utf8');
    const chainId = Buffer.from(rootChainId, 'hex');

    let effHex = parseInt(eff * 100).toString('16');
    effHex = '0'.repeat(effHex.length % 2) + effHex;
    const efficiency = Buffer.from(effHex, 'hex');
    const timestamp = getTimestampBuffer();

    const dataToSign = Buffer.concat([version, marker, chainId, efficiency, timestamp]);
    const { identityKeyPreImage, signature } = signData(sk1, dataToSign);

    return Entry.builder()
        .chainId(serverManagementSubchainId)
        .extId(version)
        .extId(marker)
        .extId(chainId)
        .extId(efficiency)
        .extId(timestamp)
        .extId(identityKeyPreImage)
        .extId(signature)
        .build();
}

function signData(sk1, dataToSign) {
    const secret = extractSecretFromIdentityKey(sk1);
    const pub = privateKeyToPublicKey(secret);
    const identityKeyPreImage = Buffer.concat([Buffer.from('01', 'hex'), pub]);

    const key = ec.keyFromSecret(secret);
    const signature = Buffer.from(key.sign(dataToSign).toBytes());

    return {
        identityKeyPreImage: identityKeyPreImage,
        signature: signature
    };
}


// Helpers //

function isValidSk1(key) {
    if (typeof key !== 'string' || key.slice(0, 3) !== 'sk1') {
        return false;
    }

    const bytes = Buffer.from(base58.decode(key));

    if (bytes.length !== 39) {
        return false;
    }

    const checksum = sha256d(bytes.slice(0, 35)).slice(0, 4);
    if (checksum.equals(bytes.slice(35, 39))) {
        return true;
    }
}

function getTimestampBuffer() {
    const timestamp = Buffer.alloc(8);
    timestamp.writeIntBE(parseInt(Date.now() / 1000), 0, 8);
    return timestamp;
}

function privateKeyToPublicKey(privateKey, enc) {
    const key = ec.keyFromSecret(Buffer.from(privateKey, enc));
    return Buffer.from(key.getPublic());
}

function extractSecretFromIdentityKey(sk) {
    return Buffer.from(base58.decode(sk).slice(3, 35));
}

module.exports = {
    updateCoinbaseAddress,
    updateEfficiency
};