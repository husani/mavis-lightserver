/**
 * DB model - mavis.scenes et al
 */
function ScenesModel(Config, logger){
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
 * Get settings for lights by scene_id
 */
ScenesModel.prototype.getSettingsByGroupIdAndSceneId = function(group_id, scene_id, callback){
	this.pool.getConnection(function(err, connection){
		//group_id is in this query only to ensure that the group really exists
		connection.query("SELECT scene_light.*, light.hue_id FROM scene_light LEFT JOIN scene ON scene.scene_id = scene_light.scene_id LEFT JOIN scene_group ON scene_group.scene_id = scene_light.scene_id LEFT JOIN light on light.light_id = scene_light.light_id WHERE scene_group.group_id = '" + group_id + "' AND scene_light.scene_id = '" + scene_id + "'", function(err, rows, fields) {
			callback(err, rows);
			connection.release();
		});
	});
}


module.exports = ScenesModel;