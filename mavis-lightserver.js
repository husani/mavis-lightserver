/**
 * mavis-lightserver: Modify Philips Hue lights via node-hue-api, broadcasts current light(s) status via Faye.
 */

//config
var Config = require('./config');

//include required modules, setup logging
var http = require('http');
var router = require('router');
var MavisHue = require('./mavishue');
var logging = require('./logging');
var logger = logging.Logging().get(Config.logging.filename);

/**
 * Connect to Mavis's hueapi wrapper.
 */
var MavisHueAPI = new MavisHue(Config.hue.bridge_ip, Config.hue.bridge_username, logger);

/**
 * Connect to database.
 */


/** 
 * All incoming HTTP requests are routed based on their URLs.
 */
var route = router();

//POWER
route.get('/power/{light_or_group}/{action}', _power);

function _power(req, res){
	//if we have a light_id, change power
	if(IsNumeric(req.params['light_or_group'])){
		MavisHueAPI.power(req.params['light_or_group'], req.params['action']);
	} else {
		//get light IDs for this group

/*
		connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
		  if (err) throw err;
		
			for(i = 0; i < rows.length; i++){
				_huePower();
			}
		});
*/

	}	
	res.end();
}



http.createServer(route).listen(Config.http.port); // start the server on port 8080


//loop getting status, broadcasts em out




function IsNumeric(input)
{
   return (input - 0) == input && input.length > 0;
}