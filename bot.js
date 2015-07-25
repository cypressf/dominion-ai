var http = require('http');
var WebSocket = require('ws');

var cookie = "__cfduid=d401519cfa9866745fb8b4949d7ae73ff1437784988; funsocketsplayercookie=%7B%220%22:%22%22,%22id%22:%22funsocketsplayercookie%22,%22cookieid%22:null,%22connectionInfo%22:%7B%22httpUrl%22:%22https://webapps.prod.dominion.makingfun.com/WebApps/bus/%22,%22gatewayUrl%22:%22ws://wss.prod.dominion.makingfun.com:80%22,%22sessionId%22:%2255b2df6fe4b0b25a5e4f1dbf%22,%22kind%22:%22player%22,%22playerName%22:%22adventuretomcat%22,%22playerId%22:%225375691ce4b0c3c58d6cc296%22,%22playerPoolId%22:%224f4120146071b0e4dada0f66%22,%22expires%22:1440377966784,%22gatewayURLHTTP%22:%22//comet.prod.dominion.makingfun.com/comet/%22,%22hmacSecret%22:%221C2D0E8DEE774E2867F3AABDF9AC232D%22%7D,%22httpUrl%22:%22https://webapps.prod.dominion.makingfun.com/WebApps/bus/%22,%22vers%22:%221.3%22%7D";

function login() {

    var username = "jeayoungpark1@gmail.com";
    var password = "ship1tlikefedex";
    var host = "webapps.prod.dominion.makingfun.com";
    var path = "/WebApps/bus/";
    var userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.89 Safari/537.36";

    var options = {
        host: host,
        path: path,
        method: 'POST',
        headers: {
            "Host": host,
            "Origin": "https://www.playdominion.com",
            "Referer": "https://www.playdominion.com/Dominion/gameClient.html",
            "Content-type": "application/x-www-form-urlencoded",
            "User-Agent": userAgent
        }
    };

    var callback = function (response) {
        var str = '';

        //another chunk of data has been received, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been received, so we just print it out here
        response.on('end', function () {
            var responseJSON = JSON.parse(str);
            console.log(responseJSON);
            websocketHandshake();
        });
    };
    var request = http.request(options, callback);
    request.write('{\
        "message": "LoginPlayer",\
        "version": 1,\
        "tag": "",\
        "data": {\
            "iv": "4852d130214207771bb707c56070b292",\
            "payload": "0r4py9bHcspEnraIyJSFq0PF7lg9/xKRRHhj+klm+Sg/H7tizuuXgGYPjaKIRK6o\ntYh2RatcWJRm9Q9hXK2yXnm8N/iZXWvmemfJK5Lftdyz7jq2HXm3g+v5m0PkAyAz\nv6GKEYKzLAZhvqmqL8IB+g=="\
        },\
        "destination": "Extension.4f41201a6071b0e4dfda0f66",\
        "packageType": "2"\
    }');
    request.end();
}

function websocketHandshake() {
    var url = "wss://wss.prod.dominion.makingfun.com/";
    //var options = {
    //    method: method,
    //    host =
    //     wss://wss.prod.dominion.makingfun.com/ HTTP/1.1
    //Host: wss.prod.dominion.makingfun.com
    //Connection: Upgrade
    //Pragma: no-cache
    //Cache-Control: no-cache
    //Upgrade: websocket
    //Origin: https://www.playdominion.com
    //    Sec-WebSocket-Version: 13
    //DNT: 1
    //User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.89 Safari/537.36
    //Accept-Encoding: gzip, deflate, sdch
    //Accept-Language: en-US,en;q=0.8
    //Sec-WebSocket-Key: 3BR1H0+BT5QIhKCxa3x9qA==
    //Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits
    //}
    var loginGateWay = {
        "message": "LoginGateway",
        "version": 1,
        "tag": "-FSMsgWSTag2",
        "data": {
            "iv": "734425e4d4c5809529c2d38e434dbe32",
            "payload": "4PV/jNlnQw/xRM3aLuesZkwTq00guPHipNcudqENAt8y2NJjoa4D1t7g+26EJT1h\n"
        },
        "destination": "",
        "packageType": "2"
    };

    var loginGateWay2 = {
        "message": "LoginGateway",
        "version": 1,
        "tag": "-FSMsgWSTag2",
        "data": {
            "iv": "3b90dd2697a24ad8366c34d424bcaa88",
            "payload": "6VkP7VGKJ+0+UYJRfBUI/A+pQxYoIgDkr1hqmqLoyLme0aVWZ7Li9reCKbWqMjAy\n"
        },
        "destination": "",
        "packageType": "2"
    }
    var ws = new WebSocket(url);
    ws.on('open', function () {
        console.log('connected');
        ws.send(loginGateWay);
    });
    ws.on('message', function (message) {
        console.log('received: %s', message);
    });
    ws.on('close', function close() {
        console.log('disconnected');
    });
    ws.on('error', function (message) {
        console.log('error: %s', message);
    });
}

login();
