const crypto = require('crypto');

function sha256(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest();
}

function sha256d(data) {
    return sha256(sha256(data));
}

function getConnectionInformation(socket, defaultPort) {
    let host = 'localhost',
        port = defaultPort;
    if (socket) {
        const splitSocket = socket.split(':');
        host = splitSocket[0] || host;
        port = splitSocket[1] || port;
    }

    return {
        host: host,
        port: port
    };
}

module.exports = {
    getConnectionInformation,
    sha256d
};