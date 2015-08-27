coinvoyWallet.factory('TxSocket', function($websocket) {

    var openSocket = function(userId) {

        // Open a WebSocket connection
        this.dataStream = $websocket("wss://coinvoy.net/wallet/ws/live");

        this.transactions = [];
        this.userId = userId;
        //---
        var conn = this;

        this.dataStream.onClose(function(){
            console.log( "Socket connection is closed.");
            this.reconnect();
        });
        this.dataStream.onError(function(){
            console.log("Socket connection error.");
        });
        this.dataStream.onOpen(function(){
            
            console.log( "Socket connection open.");
            this.send('{"method": "syn", "id": '+userId+'}');
            var stream = this;
            // keep connection open
            window.setTimeout(function(){
                console.log( "Ping.");
                stream.send('{"method": "ping"}');
            }, 40000); // 40 seconds intervals for Ping Pong
        });

        this.dataStream.onMessage(function(evt) {
            
            if(evt.data == "pong") {
                console.log( "Pong.");
                var stream = this;
                window.setTimeout(function(){
                    console.log( "Ping.");
                    stream.send('{"method": "ping"}');
                }, 40000); // 40 seconds intervals for Ping Pong
                return;
            }
            
            //get tx data
            var data = JSON.parse(evt.data);
            if(data.from_user_id == window.user.id || data.to_user_id == window.user.id) {
                angular.forEach(conn.transactions, function(callback){
                    callback(data);
                });
            }
        });

        return this;
    }

    var txSocket = {
        conn: false,

        open: function(userId) {
            this.conn = openSocket(userId);
            return this;
        },
        close: function() {
            this.conn.dataStream.close();
            setTimeout(function() {
                this.conn = openSocket(this.conn.userId);
            },500)
        },
        addTxCallback: function(txFn) {
            this.conn.transactions.push(txFn);
            return this;
        }
    };

    return txSocket;
})