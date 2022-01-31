const { ref } = require( 'vue');
const minimist = require( 'minimist');
const argv = minimist(process.argv.slice(2));


// IP address of HTP-1, used to connect to websocket
const websocketIp = ref(argv['ip-address']);

module.exports = function useLocalStorage() {

  function setWebsocketIp(url) {
    websocketIp.value = url;
  }

  return {
    websocketIp,
    setWebsocketIp,
  };
}