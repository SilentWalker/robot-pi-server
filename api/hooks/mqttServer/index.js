'use strict'
const mosca = require('mosca');
module.exports = function MqttServer(sails){
  return {
    initialize: function(cb){
      function setUpServer(){
        const pubsub = sails.config.innerPubsub;
        sails.log.debug('Mqtt Server Hook Loaded');
        let ascoltatore = {
          type: 'redis',
          redis: require('redis'),
          db: 12,
          port: 6379,
          return_buffers: true, // to handle binary payloads
          host: "localhost"
        };

        let moscaSettings = {
          port: sails.config.mqttPort,
          backend: ascoltatore,
          persistence: {
            factory: mosca.persistence.Redis
          }
        };

        let authenticate = function(client, username, password, callback) {
          let authorized = (username === sails.config.username && password.toString() === sails.config.password);
          if (authorized) client.user = username;
          callback(null, authorized);
        }

        let server = new mosca.Server(moscaSettings);
        server.on('ready', setup);

        server.on('clientConnected', function(client) {
          sails.log.debug('client connected', client.id);
        });

        server.on('clientDisconnected', function(client) {
          sails.log.debug('client disconnected', client.id);
        });

        server.on('published', (packet, client) => {
          switch(packet.topic){
            case 'sendMsg' : 
              //发送微信消息
            break;
          }
        })

        pubsub.on('msg', (clientId, msg) => {
          let message = {
            topic : clientId,
            payload: msg,
            qos : 2,
            retain : false
          };
          server.publish(message, function(){
            sails.log.info(`topic : ${message.topic}, payload : ${message.payload} published`)
          })
        });

        function setup() {
          sails.log.debug(`Mosca server is up and running at port ${moscaSettings.port}`);
          server.authenticate = authenticate;
        };
      }
      sails.after(['lifted'], function() {
        setUpServer();
      });
      return cb();
    }
  }
}
