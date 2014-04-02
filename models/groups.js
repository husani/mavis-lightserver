/**
 * DB model - mavis.groups et al
 */
function GroupsModel(Config, logger){
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
 * Add new group.
 */
GroupsModel.prototype.addGroup = function(name, desc, callback){
	this.pool.getConnection(function(err, connection){
		connection.query("INSERT INTO `group` (`name`, `desc`) VALUES ('" + decodeURIComponent(name) + "', '" + decodeURIComponent(desc) + "')", function(err, result){
			callback(err, result.insertId);
			connection.release();
		});
	});
}

/**
 * Edit group.
 */
GroupsModel.prototype.editGroup = function(name, desc, group_id, callback){
	this.pool.getConnection(function(err, connection){
		connection.query("UPDATE `group` SET `name`='" + decodeURIComponent(name) + "', `desc`='" + decodeURIComponent(desc) + "' WHERE group_id='" + group_id + "'", function(err, result){
			callback(err, result);
			connection.release();
		});
	});
}

/**
 * Delete group. FK constraints in DB cascade this delete.
 */
GroupsModel.prototype.deleteGroup = function(group_id, callback){
	this.pool.getConnection(function(err, connection){
		connection.query("DELETE FROM `group` WHERE `group_id`='" + group_id + "'", function(err, result){
			callback(err, result);
			connection.release();
		});
	});
}

/**
 * Assign light to group
 */
GroupsModel.prototype.assignLight = function(light_id, group_id, callback){
	this.pool.getConnection(function(err, connection){
		connection.query("INSERT INTO `light_group` (`light_id`, `group_id`) VALUES ('" + light_id + "', '" + group_id + "')", function(err, result){
			callback(err, result);
			connection.release();
		});
	});
}

/**
 * Remove light from group
 */
GroupsModel.prototype.deassignLight = function(light_id, group_id, callback){
	this.pool.getConnection(function(err, connection){
		connection.query("DELETE FROM `light_group` WHERE `light_id`='" + light_id + "' AND `group_id`='" + group_id + "'", function(err, result){
			callback(err, result);
			connection.release();
		});
	});
}

module.exports = GroupsModel;