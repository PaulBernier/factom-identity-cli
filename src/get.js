const base58 = require('base-58');
const { sha256d } = require('./util');
const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');

const VERSION_0 = Buffer.alloc(1);

async function getIdentityInformation(cli, rootChainId) {
    const rootEntries = await getIdentityRootChainEntries(cli, rootChainId);
    const identityKey1 = getIdentityKeys(rootEntries[0])[0];

    const serverManagementSubchainId = extractServerManagementSubchainId(rootEntries);
    const managementEntries = await getServerManagementSubchainEntries(cli, serverManagementSubchainId, rootChainId);

    const coinbaseAddress = getCoinbaseAddress(rootChainId, rootEntries, identityKey1);
    const efficiency = getEfficiency(rootChainId, managementEntries, identityKey1);

    return { serverManagementSubchainId: serverManagementSubchainId.toString('hex'), coinbaseAddress, efficiency };
}

function getCoinbaseAddress(rootChainId, rootEntries, identityKey1) {
    // TODO: use the timestamp of the message for ordering and not ordering of entries?
    for (const entry of rootEntries.reverse()) {
        if (isValidCoinbaseAddressRegistration(entry, rootChainId, identityKey1)) {
            return keyToFctPublicAddress(entry.extIds[3]);
        }
    }
}

function getEfficiency(rootChainId, managementEntries, identityKey1) {

    // TODO: use the timestamp of the message for ordering and not ordering of entries?
    for (const entry of managementEntries.reverse()) {
        if (isValidEfficiencyRegistration(entry, rootChainId, identityKey1)) {
            return parseInt(entry.extIds[3].toString('hex'), 16) / 100;
        }
    }
}

async function getIdentityRootChainEntries(cli, rootChainId) {

    const entries = await cli.getAllEntriesOfChain(rootChainId);

    const extIds = entries[0].extIds;
    if (!extIds[0].equals(VERSION_0) ||
        extIds[1].toString() !== 'Identity Chain' ||
        extIds.length !== 7) {
        throw new Error('Invalid Root Factom Identity Chain');
    }

    return entries;
}

async function getServerManagementSubchainEntries(cli, serverManagementSubchainId, rootChainId) {
    const entries = await cli.getAllEntriesOfChain(serverManagementSubchainId);

    const extIds = entries[0].extIds;
    if (!extIds[0].equals(VERSION_0) ||
        extIds[1].toString() !== 'Server Management' ||
        extIds.length !== 4) {
        throw new Error('Invalid Server Management Subchain');
    }

    if (rootChainId && rootChainId !== extIds[2].toString('hex')) {
        throw new Error('This Server Management Subchain doesn\'t reference the Identity Root Chain Id provided');
    }

    return entries;
}

///////////////// Helpers /////////////////

function extractServerManagementSubchainId(rootEntries) {
    const identityKey1 = getIdentityKeys(rootEntries[0])[0];

    const serverManagementSubchainEntry = rootEntries.find(e => e.extIds[1].toString() === 'Register Server Management');

    verifyServerManagementSubchainRegistration(serverManagementSubchainEntry, identityKey1);
    return serverManagementSubchainEntry.extIds[2];
}

function isValidCoinbaseAddressRegistration(entry, rootChainId, identityKey1) {
    const extIds = entry.extIds;

    if (!extIds[0].equals(VERSION_0) ||
        extIds[1].toString() !== 'Coinbase Address' ||
        extIds[2].toString('hex') !== rootChainId ||
        !sha256d(extIds[5]).equals(identityKey1)) {
        return false;
    }

    const data = Buffer.concat(extIds.slice(0, 5));
    const key = ec.keyFromPublic([...extIds[5].slice(1)]);

    if (!key.verify(data, [...extIds[6]])) {
        return false;
    }

    return true;
}


// TODO: copy of isValidCoinbaseAddressRegistration
function isValidEfficiencyRegistration(entry, rootChainId, identityKey1) {
    const extIds = entry.extIds;

    if (!extIds[0].equals(VERSION_0) ||
        extIds[1].toString() !== 'Server Efficiency' ||
        extIds[2].toString('hex') !== rootChainId ||
        !sha256d(extIds[5]).equals(identityKey1)) {
        return false;
    }

    const data = Buffer.concat(extIds.slice(0, 5));
    const key = ec.keyFromPublic([...extIds[5].slice(1)]);

    if (!key.verify(data, [...extIds[6]])) {
        return false;
    }

    return true;
}

function getIdentityKeys(entry) {
    const extIds = entry.extIds;
    return [extIds[2], extIds[3], extIds[4], extIds[5]];
}

function verifyServerManagementSubchainRegistration(entry, identityKey1) {
    const extIds = entry.extIds;

    if (!extIds[0].equals(VERSION_0) ||
        extIds[1].toString() !== 'Register Server Management' ||
        extIds[2].length !== 32 ||
        !sha256d(extIds[3]).equals(identityKey1)) {
        throw new Error('Invalid Server Managemenet Subchain registration');
    }

    const data = Buffer.concat(extIds.slice(0, 3));
    const key = ec.keyFromPublic([...extIds[3].slice(1)]);

    if (!key.verify(data, [...extIds[4]])) {
        throw new Error('Invalid signature of the Server Managemenet Subchain registration');
    }
}

// TODO: this should be implemented in factom.js
function keyToFctPublicAddress(key) {
    const address = Buffer.concat([Buffer.from('5fb1', 'hex'), key]);
    const checksum = sha256d(address);
    return base58.encode(Buffer.concat([address, checksum.slice(0, 4)]));
}

module.exports = {
    getIdentityInformation,
    getIdentityRootChainEntries,
    getServerManagementSubchainEntries,
    getIdentityKeys,
    extractServerManagementSubchainId
};