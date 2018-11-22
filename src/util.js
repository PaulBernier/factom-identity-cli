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
    getConnectionInformation
};