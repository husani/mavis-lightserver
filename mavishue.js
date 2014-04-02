/**
 * Wrapper for node-hue-api
 */
function MavisHueAPI(bridge_ip, bridge_username, logger, MessagingClient) {
	this.bridge_ip = bridge_ip;
	this.bridge_username = bridge_username;
	this.logger = logger;
	this.MessagingClient = MessagingClient;

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
			self.logger.info("POWER: ERROR during power change attempt: " + err);
		}
		//successful change -- broadcast status update
		self.MessagingClient.publish("/lights/light/" + light_id , new_state)
	});
}

/**
 * Apply a "scene" to a "group". This method receives an array of lights and their settings.
 */
MavisHueAPI.prototype.scene = function(group_id, scene_id, lights_settings){
	var self = this;
	
	this.logger.info("SCENE: applying scene " + scene_id + " to group " + group_id);
	//this.logger.debug(lights_settings);

	//create complex state for each light and apply it.
	for(light in lights_settings){
		var settings = lights_settings[light] //convenience

		var lightState = this.hue.lightState;
	    var state;
	    
	    if(lights_settings[light].on == "1"){
			state = lightState.create().on().brightness(settings.bri).hsl(settings.hue, settings.sat, settings.bri).xy(settings.xy_x, settings.xy_y);
	    } else {
			state = lightState.create().off();	    
	    }

		//this is in another function so we get the right hue_id/etc passed to it
		this._setScene(settings.hue_id, settings.light_id, group_id, scene_id, state);	    	
	}
	
}

/**
 * Do work of applying scene
 */
MavisHueAPI.prototype._setScene = function(hue_id, light_id, group_id, scene_id, state){
	var self = this;

	this.api.setLightState(hue_id, state, function(err, result){
		if (err){ 
			self.logger.info("SCENE: ERROR during scene change attempt:" + err);
		}
		self.logger.debug(hue_id);

		//successful change -- broadcast status update
		self.MessagingClient.publish("/lights/light/" + light_id, state);
		//FIXFIX - find a better way. this should really only be sent ONCE, at end of all state changes.
		self.MessagingClient.publish("/lights/group/" + group_id , {'scene': scene_id});

	});
}

/**
 * Change an individual light's settings
 */
MavisHueAPI.prototype.light = function(light_id, settings){
	this.logger.debug(light_id);
	this.logger.debug(settings.sat);
}

/**
 * Change name of an individual light
 */
MavisHueAPI.prototype.lightName = function(name, hue_id, callback){
	var self = this;

	this.api.setLightName(hue_id, name, function(err, result){
		if (err){ 
			self.logger.info("MANAGE: ERROR during light rename attempt:" + err);
		}
		callback(err, result);
	});
}

/**
 * Get status of bridge
 */
MavisHueAPI.prototype.bridgeStatus = function(callback){
	this.api.getFullState(function(err, status){
		callback(err, status);
	});
}

module.exports = MavisHueAPI;
