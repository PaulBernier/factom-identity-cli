const { URL } = require('url');

function getConnectionInformation(endpoint) {
    const url = new URL(endpoint.includes('://') ? endpoint : `http://${endpoint}`);
    return {
        host: url.hostname,
        port: getIntegerPort(url),
        protocol: url.protocol.slice(0, -1),
        path: url.pathname
    };
}

function getIntegerPort(url) {
    if (url.port) {
        return parseInt(url.port);
    } else {
        return url.protocol === 'https:' ? 443 : 80;
    }
}

module.exports = {
    getConnectionInformation
};
