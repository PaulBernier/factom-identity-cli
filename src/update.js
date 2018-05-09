const {
    Entry,
    isValidFctPublicAddress,
    isValidEcPrivateAddress,
    addressToKey,
    composeEntry
} = require('factom');
const fs = require('fs');
const { getIdentityRootChainEntries, getIdentityKeys, extractServerManagementSubchainId } = require('./get');
const { sha256d } = require('./util');

const base58 = require('base-58');
const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');

/////////////////////////////////////
// Update with blockchain validation
////////////////////////////////////

async function updateCoinbaseAddress(cli, rootChainId, fctAddress, sk1, ecPrivateAddress) {
    if (!isValidSk1(sk1)) {
        throw new Error('Lowest level identity key (sk1) is not valid');
    }
    if (!isValidFctPublicAddress(fctAddress)) {
        throw new Error(`Invalid public FCT address: ${fctAddress}`);
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
        throw new Error(`The SK1 key cannot sign in the Identity Root Chain ${rootChainId}`);
    }

    const entry = getCoinbaseAddressChangeEntry(rootChainId, fctAddress, sk1);
    return await cli.addEntry(entry, ecPrivateAddress);
}

async function updateEfficiency(cli, rootChainId, efficiency, sk1, ecPrivateAddress) {
    if (!isValidSk1(sk1)) {
        throw new Error('Lowest level identity key (sk1) is not valid');
    }
    if (typeof efficiency !== 'number' || efficiency < 0 || efficiency > 100) {
        throw new Error('Efficiency must be a number between 0 and 100');
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
        throw new Error(`The SK1 cannot sign in the Identity Root Chain ${rootChainId}`);
    }

    const serverManagementSubchainId = extractServerManagementSubchainId(rootEntries);
    const entry = getEfficiencyChangeEntry(rootChainId, serverManagementSubchainId, efficiency, sk1);

    return await cli.addEntry(entry, ecPrivateAddress);
}

/////////////////////////////////////
// Generate entry only
////////////////////////////////////

function generateUpdateCoinbaseAddressEntry(rootChainId, fctAddress, sk1, ecPrivateAddress) {
    if (!isValidIdentityChainId(rootChainId)) {
        throw new Error(`Invalid root chain id ${rootChainId}`);
    }
    if (!isValidSk1(sk1)) {
        throw new Error('Lowest level identity key (sk1) is not valid');
    }
    if (!isValidFctPublicAddress(fctAddress)) {
        throw new Error(`Invalid public FCT address: ${fctAddress}`);
    }
    if (!isValidEcPrivateAddress(ecPrivateAddress)) {
        throw new Error(`Invalid private EC address ${ecPrivateAddress}`);
    }

    return getCoinbaseAddressChangeEntry(rootChainId, fctAddress, sk1);
}

function generateUpdateEfficiencyEntry(rootChainId, serverManagementSubchainId, efficiency, sk1, ecPrivateAddress) {
    if (!isValidIdentityChainId(rootChainId)) {
        throw new Error(`Invalid root chain id ${rootChainId}`);
    }
    if (!isValidIdentityChainId(serverManagementSubchainId)) {
        throw new Error(`Invalid root chain id ${rootChainId}`);
    }
    if (!isValidSk1(sk1)) {
        throw new Error('Lowest level identity key (sk1) is not valid');
    }
    if (typeof efficiency !== 'number' || efficiency < 0 || efficiency > 100) {
        throw new Error('Efficiency must be a number between 0 and 100');
    }
    if (!isValidEcPrivateAddress(ecPrivateAddress)) {
        throw new Error(`Invalid private EC address ${ecPrivateAddress}`);
    }

    return getEfficiencyChangeEntry(rootChainId, serverManagementSubchainId, efficiency, sk1);
}

function generateUpdateEfficiencyScript(rootChainId, serverManagementSubchainId, efficiency, sk1, ecPrivateAddress, factomdInformation) {
    const entry = generateUpdateEfficiencyEntry(rootChainId, serverManagementSubchainId, efficiency, sk1, ecPrivateAddress);
    const composed = composeEntry(entry, ecPrivateAddress);
    const script = generateScript(`Updating identity [${rootChainId}] with efficiency [${efficiency}]`,
        composed.commit.toString('hex'), composed.reveal.toString('hex'), factomdInformation);
    fs.writeFileSync('update-efficiency.sh', script);
}

function generateUpdateCoinbaseAddressScript(rootChainId, fctAddress, sk1, ecPrivateAddress, factomdInformation) {
    const entry = generateUpdateCoinbaseAddressEntry(rootChainId, fctAddress, sk1, ecPrivateAddress);
    const composed = composeEntry(entry, ecPrivateAddress);
    const script = generateScript(`Updating identity [${rootChainId}] with coinbase address [${fctAddress}]`,
        composed.commit.toString('hex'), composed.reveal.toString('hex'), factomdInformation);
    fs.writeFileSync('update-coinbase-address.sh', script);
}

function generateScript(message, commit, reveal, factomdInformation) {
    let template = fs.readFileSync(`${__dirname}/bash-template/update.sh`).toString();
    template = template.replace('_HEADER_MESSAGE_', message);
    template = template.replace('_COMMIT_MESSAGE_', commit);
    template = template.replace('_REVEAL_MESSAGE_', reveal);
    template = template.replace('_HOST_', factomdInformation.host);
    template = template.replace('_PORT_', factomdInformation.port);
    return template;
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
    effHex = effHex.padStart(4, '0');
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

function isValidIdentityChainId(rootChainId) {
    return typeof rootChainId === 'string' &&
        rootChainId.length === 64 &&
        rootChainId.startsWith('888888');
}

function getTimestampBuffer() {
    const timestamp = Buffer.alloc(8);
    timestamp.writeIntBE(parseInt(Date.now() / 1000), 2, 6);
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
    updateEfficiency,
    generateUpdateEfficiencyEntry,
    generateUpdateCoinbaseAddressEntry,
    generateUpdateEfficiencyScript,
    generateUpdateCoinbaseAddressScript
};