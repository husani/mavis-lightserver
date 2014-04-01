/**
 * Connect to Hue bridge and add all lights to DB. 
 * WARNING: This script will TRUNCATE ALL TABLES in the mavis-lightserver database.
 */

//config
var Config = require('./config');

//include required modules, setup logging
var http = require('http');
var HueApi = require("node-hue-api").HueApi;
var mysql = require('mysql');
var logging = require('./logging');
var logger = logging.Logging().get(Config.logging.filename);

var hue = new HueApi(Config.hue.bridge_ip, Config.hue.bridge_username);

//connect to database...
var connection = mysql.createConnection({
  host     : Config.database.host,
  user     : Config.database.user,
  password : Config.database.password,
  database : Config.database.database
});
connection.connect();

//and empty out stored lights/groups.
connection.query('DELETE FROM light', function(err, rows, fields) {
  if (err) throw err;
  console.log("DB: Deleted mavis-lightserver.light");
});
connection.query('DELETE FROM `group`', function(err, rows, fields) {
  if (err) throw err;
  console.log("DB: Deleted mavis-lightserver.group");
});


/**
 * Get full status from hue bridge
 */
var sql = [];
hue.getFullState(function(err, bridge_status){
	if(err) throw err;

	//iterate through lights create sql statements for each
	for(light in bridge_status.lights){
		sql.push("INSERT INTO light (`hue_id`, `name`, `desc`) VALUES ('" + light + "', '" + bridge_status.lights[light].name + "', '" + bridge_status.lights[light].type + "')");
	}

	//add the lights
	addAllLightsToDB();

});

/**
 * Iterate through SQL statements and add all lights to the database.
 */
function addAllLightsToDB(){
	for(i = 0; i < sql.length; i++){
		connection.query(sql[i], function(err, rows, fields) {
			if (err) throw err;
			console.log("DB: Inserted light.");
		});
	}
	
	connection.end(function(err){
		console.log("All lights inserted into DB, exiting.");
	});
}

