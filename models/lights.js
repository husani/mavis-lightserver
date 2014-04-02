/**
 * DB model - mavis.lights
 */
function LightsModel(Config, logger){
	this.logger = logger;

	this.mysql = require('mysql');

	this.pool = this.mysql.createPool({
	  host     : Config.database.host,
	  user     : Config.database.user,
	  password : Config.database.password,
	  database : Config.database.database
	});

}

/**
 * Get hue_id by light_id
 */
LightsModel.prototype.getLightByLightId = function(light_id, callback){
	this.pool.getConnection(function(err, connection){
		connection.query("SELECT light.hue_id FROM light WHERE light.light_id = '" + light_id + "'", function(err, rows, fields) {
			callback(err, rows);
			connection.release();
		});
	});
}

/**
 * Get hue_id(s) by group name
 */
LightsModel.prototype.getLightsByGroupName = function(group_name, callback){
	this.pool.getConnection(function(err, connection){
		connection.query("SELECT light.hue_id FROM light, `group` LEFT JOIN light_group ON group.group_id = light_group.group_id WHERE light.light_id = light_group.light_id AND group.name = '" + decodeURIComponent(group_name) + "'", function(err, rows, fields) {
			callback(err, rows);
			connection.release();
		});
	});
}

/**
 * Add a light
 */
LightsModel.prototype.addLight = function(name, desc, hue_id, callback){
	this.pool.getConnection(function(err, connection){
		connection.query("INSERT INTO light (`hue_id`, `name`, `desc`) VALUES ('" + hue_id + "', '" + name + "', '" + desc + "')", function(err, result) {
			callback(err, result.insertId);
			connection.release();
		});
	});
}

/**
 * Edit light.
 */
LightsModel.prototype.editLight = function(name, desc, light_id, callback){
	this.pool.getConnection(function(err, connection){
		connection.query("UPDATE `light` SET `name`='" + decodeURIComponent(name) + "', `desc`='" + decodeURIComponent(desc) + "' WHERE light_id='" + light_id + "'", function(err, result){
			callback(err, result);
			connection.release();
		});
	});
}

module.exports = LightsModel;