'use strict'
const mqtt = require('mqtt');
module.exports = function mqttClient(sails){
  return{
    initialize : function(cb){
      let me = this;
      function setUpClient(){
        sails.log.debug('Mqtt Client Hook started')
        const pubsub = sails.config.innerPubsub;
        let client = mqtt.connect('http://127.0.0.1', {
          keepalive : 30,
          clientId : sails.config.clientId,
          username : sails.config.mqttClinetUsername,
          password : sails.config.mqttClinetPassword,
          port : sails.config.mqttClinetPort,
          connectTimeout : 3000,
        })
        //连接成功
        client.on('connect', () => {
          client.subscribe(sails.config.clientId, {qos : 2});
        })
        //处理消息
        client.on('message', (topic, message) => {
          let msgArr = message.toString().split(',');
          //[ 'pi', 'pi01', 'move', '0', '0', '535' ]
          if(msgArr.length ===  6){
            pubsub.emit('msg', (msgArr[1], [msgArr[2], msgArr[3], msgArr[4]].join('|')));
          }
        })
      }
      sails.after(['lifted'], function() {
        setUpClient();
      });
      return cb();
    }
  }
}