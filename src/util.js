const colors = require('colors');

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

function printError(e) {
    const message = e instanceof Error ? e.message : e;
    console.error(colors.red(`Error: ${message}`));
}

module.exports = {
    getConnectionInformation,
    printError
};