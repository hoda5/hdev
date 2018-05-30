
function init_hdev_client(io) {

    io.on('connect', function (socket) {
        const element = document.querySelector('#hdev');
        io.on('hdev-reload', function () {
            location.reload();
        });
        io.on('hdev-refresh', function (content) {
            element.textContent = JSON.stringify(content, null, 2);
        });
    });

    // let socket;

    // return {
    //     connect() {
    //         const m = /([^:]*):\/\/([^\/]*)\/?(.*)?/g.exec(document.URL);
    //         const url = "ws://" + m[2];

    //         const wsCtor = window['MozWebSocket'] ? MozWebSocket : WebSocket;
    //         socket = new wsCtor(url, 'hdev-v1');


    //         // socket.onmessage = function (message) {
    //         //     try {
    //         //         const command = JSON.parse(message.data);
    //         //         const handle = messageHandlers[command.cmd];
    //         //         if (handle) handle(command);
    //         //     }
    //         //     catch (e) { }
    //         // }
    //         socket.onclose = function () {
    //             console.log('todo autoreload')
    //         }
    //     },
    // }
    // function send(cmd, data) {
    //     socket.send(JSON.stringify({ cmd, data }));
    // }
}        