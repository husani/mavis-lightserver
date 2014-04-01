/**
 * Wrapper for node-hue-api
 */
function MavisHueAPI(bridge_ip, bridge_username, logger) {
	this.bridge_ip = bridge_ip;
	this.bridge_username = bridge_username;
	this.logger = logger;

	this.hue = require("node-hue-api");
	this.HueApi = this.hue.HueApi,
    this.api = new this.HueApi(this.bridge_ip, this.bridge_username);
}

/**
 * Turn on/off a light.
 */
MavisHueAPI.prototype.power = function(light_id, action){
	var self = this;

	this.logger.info("POWER: turning " + light_id + " " + action);

	var lightState = this.hue.lightState;
    var state = lightState.create();
    var new_state;
    
    if(action == "on"){
    	new_state = state.on();
    } else {
    	new_state = state.off();
    }

	this.api.setLightState(light_id, new_state, function(err, result){
		if (err){ 
			self.logger.info("POWER: ERROR during power change attempt.");
		}
	});
}



module.exports = MavisHueAPI;
