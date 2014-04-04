/**
 * mavis-lightserver: Modify Philips Hue lights via node-hue-api, broadcasts current light(s) status via Faye.
 */

//config
var Config = require('./config');

//include required modules, setup logging
var http = require('http');
var qs = require('querystring');
var faye = require('faye');
var router = require('router');
var GroupsModel = require('./models/groups');
var LightsModel = require('./models/lights');
var ScenesModel = require('./models/scenes');
var MavisHue = require('./mavishue');
var logging = require('./logging');
var logger = logging.Logging().get(Config.logging.filename);

var MessagingClient = new faye.Client('http://localhost:9000/');

/**
 * Connect to Mavis's hueapi wrapper.
 */
var MavisHueAPI = new MavisHue(Config.hue.bridge_ip, Config.hue.bridge_username, logger, MessagingClient);

/**
 * Init db model
 */
var GroupsModel = new GroupsModel(Config, logger);
var LightsModel = new LightsModel(Config, logger);
var ScenesModel = new ScenesModel(Config, logger);


/** 
 * All incoming HTTP requests are routed based on their URLs.
 */
var route = router();

//POWER
route.get('/power/{light_or_group}/{action}', _power);
function _power(req, res){
	//enable cross-domain
	_cors(res);
	//convert light_id to hue_id OR group name to light_ids
	if(IsNumeric(req.params['light_or_group'])){
		LightsModel.getLightByLightId(req.params['light_or_group'], function(err, results){
			if((err) || (results.length < 1)){
				logger.warn("Unable to find light in database.", {light_or_group: req.params['light_or_group']});
			} else {
				//change power setting
				MavisHueAPI.power(results[0].hue_id, req.params['action']);
			}
		});
	} else {
		LightsModel.getLightsByGroupName(req.params['light_or_group'], function(err, results){
			if((err) || (results.length < 1)){
				logger.warn("Unable to find group in database.", {light_or_group: req.params['light_or_group']});
			} else {
				for(i = 0; i < results.length; i++){
					//change power settings
					MavisHueAPI.power(results[i].hue_id, req.params['action']);
				}
			}
		});
	}	
	res.end();
}

//SCENE
route.get('/scene/{group_id}/{scene_id}', _scene);
function _scene(req, res){
	//enable cross-domain
	_cors(res);
	ScenesModel.getSettingsByGroupIdAndSceneId(req.params['group_id'], req.params['scene_id'], function(err, results){
		if((err) || (results.length < 1)){
			logger.warn("Unable to find either scene or group.", {scene_id: req.params['scene_id'], group_id: req.params['group_id']});
		} else {
			MavisHueAPI.scene(req.params['group_id'], req.params['scene_id'], results);
		}
	});
	res.end();
}

//INDIVIDUAL LIGHT
route.post('/light/', _light);
function _light(req, res){
	//enable cross-domain
	_cors(res);
	var body = "";
	req.on('data', function(data){
		body += data;
	});
	req.on('end', function(){
		var POST = qs.parse(body);
		LightsModel.getLightByLightId(POST.light_id, function(err, results){
			if((err) || (results.length < 1)){
				logger.warn("Unable to find light in database.", {light_id: POST.light_id});
			} else {
				//change light settings
				MavisHueAPI.light(hue_id, POST);
			}
		});		
	});
	res.end();
}

//SYSTEM MANAGEMENT

//get overall status
route.get('/manage/setup/get-system-info', _manage_status);
function _manage_status(req, res){
	//enable cross-domain
	_cors(res);
	var response = {};
	response.status = 1;
	response.group_id = "whaty up";
	res.write(JSON.stringify(response));		
	res.end();
}

//add all lights to db, create first group
route.get('/manage/setup/set-defaults/', _manage_setdefaults);
function _manage_setdefaults(req, res){
	//enable cross-domain
	_cors(res);
	//create a default group
	GroupsModel.addGroup("Apartment", "All lights in entire apartment", function(err, group_id){
		if((err) || (!group_id)){
			logger.error("Unable to add default group! Exiting.");
			throw err;
		}
		logger.info("MANAGE / SETUP / SET DEFAULTS: Added default group.");
		MavisHueAPI.bridgeStatus(function(err, bridge_status){
			if(err){
				logger.error("Unable to get status from bridge. Exiting.");
				throw err;			
			}
			logger.info("MANAGE / SETUP / SET DEFAULTS: Got bridge status.");
			for(light in bridge_status.lights){
				//insert light to db
				LightsModel.addLight(bridge_status.lights[light].name, bridge_status.lights[light].type, light, function(err, light_id){
					if(err){
						logger.error("Unable to add light to database. Exiting.", {light: bridge_status.lights[light]});
						throw err;			
					}
					logger.info("MANAGE / SETUP / SET DEFAULTS: Added light.", {light_id: light_id});
					//add to group
					GroupsModel.assignLight(light_id, group_id, function(err){
						if(err){
							logger.error("Unable to assign light to group. Exiting.", {light_id: light_id, group_id: group_id});
							throw err;			
						}					
						logger.info("MANAGE / SETUP / SET DEFAULTS: Assigned light to group", {light_id: light_id, group_id: group_id});
					});
				});
			}		
		});
	
	});
	res.end();	
}

//GROUP

//create new group
route.post('/manage/group/add/', _manage_group_add);
function _manage_group_add(req, res){
	//enable cross-domain
	_cors(res);
	var body = "";
	req.on('data', function(data){
		body += data;
	});
	req.on('end', function(){
		var POST = qs.parse(body);
		GroupsModel.addGroup(POST.name, POST.desc, function(err, group_id){
			var response = {};
			if((err) || (!group_id)){
				logger.warn("Unable to add group.", {name: POST.name, desc: POST.desc});
				response.status = 0;
			}
			logger.info("MANAGE / GROUP / ADD: Added group.", {group_id: group_id});
			response.status = 1;
			response.group_id = group_id;
			res.write(JSON.stringify(response));		
			res.end();
		});
	});
}

//edit group
route.post('/manage/group/edit/', _manage_group_edit);
function _manage_group_edit(req, res){
	//enable cross-domain
	_cors(res);
	var body = "";
	req.on('data', function(data){
		body += data;
	});
	req.on('end', function(){
		var POST = qs.parse(body);
		GroupsModel.editGroup(POST.name, POST.desc, POST.group_id, function(err, result){
			var response = {};
			if((err) || (!result)){
				logger.warn("Unable to edit group.", {name: POST.name, desc: POST.desc, group_id: POST.group_id});
				response.status = 0;
			}
			logger.info("MANAGE / GROUP / EDIT: Edited group.", {group_id: POST.group_id});	
			response.status = 1;
			res.write(JSON.stringify(response));		
			res.end();
		});
	});
}

//delete group
route.post('/manage/group/delete/', _manage_group_delete);
function _manage_group_delete(req, res){
	//enable cross-domain
	_cors(res);
	var body = "";
	req.on('data', function(data){
		body += data;
	});
	req.on('end', function(){
		var POST = qs.parse(body);
		GroupsModel.deleteGroup(POST.group_id, function(err, result){
			var response = {};
			if((err) || (!result)){
				logger.warn("Unable to delete group.", {group_id: POST.group_id});
				response.status = 0;
			}
			logger.info("MANAGE / GROUP / EDIT: Deleted group and all light assignments to group.", {group_id: POST.group_id});	
			response.status = 1;
			res.write(JSON.stringify(response));		
			res.end();
		});
	});
}

//assign light to group
route.post('/manage/group/assignlight/', _manage_group_assignlight);
function _manage_group_assignlight(req, res){
	//enable cross-domain
	_cors(res);
	var body = "";
	req.on('data', function(data){
		body += data;
	});
	req.on('end', function(){
		var POST = qs.parse(body);
		GroupsModel.assignLight(POST.light_id, POST.group_id, function(err, result){
			var response = {};
			if((err) || (!result)){
				logger.warn("Unable to assign light.", {light_id: POST.light_id, group_id: POST.group_id});
				response.status = 0;
			}
			logger.info("MANAGE / GROUP / ASSIGN LIGHT: Assigned light.", {light_id: POST.light_id, group_id: POST.group_id});	
			response.status = 1;
			res.write(JSON.stringify(response));		
			res.end();
		});
	});
}

//remove light from group
route.post('/manage/group/deassignlight/', _manage_group_deassignlight);
function _manage_group_deassignlight(req, res){
	//enable cross-domain
	_cors(res);
	var body = "";
	req.on('data', function(data){
		body += data;
	});
	req.on('end', function(){
		var POST = qs.parse(body);
		GroupsModel.deassignLight(POST.light_id, POST.group_id, function(err, result){
			var response = {};
			if((err) || (!result)){
				logger.warn("Unable to deassign light in database.", {light_id: POST.light_id, group_id: POST.group_id});
				response.status = 0;
			}
			logger.info("MANAGE / GROUP / DEASSIGN LIGHT: Deassigned light.", {light_id: POST.light_id, group_id: POST.group_id});	
			response.status = 1;
			res.write(JSON.stringify(response));		
			res.end();
		});
	});
}


//LIGHT

//edit light
route.post('/manage/light/edit/', _manage_light_edit);
function _manage_light_edit(req, res){
	//enable cross-domain
	_cors(res);
	var body = "";
	req.on('data', function(data){
		body += data;
	});
	req.on('end', function(){
		var POST = qs.parse(body);
		LightsModel.editLight(POST.name, POST.desc, POST.light_id, function(err, result){
			var response = {};
			if((err) || (!result)){
				logger.warn("Unable to edit light name in database.", {name: POST.name, desc: POST.desc, light_id: POST.light_id});
				response.status = 0;
			}
			//edit light name on bridge as well.
			LightsModel.getLightByLightId(POST.light_id, function(err, result){
				if((err) || (!result)){
					logger.warn("Unable to get light from database.", {name: POST.name, desc: POST.desc, light_id: POST.light_id});
					response.status = 0;
				}
				MavisHueAPI.lightName(POST.name, result[0].hue_id, function(err, bridge_result){
					logger.info("MANAGE / LIGHT / EDIT: Edited light name.", {light_id: POST.light_id});	
					response.status = 1;
					res.write(JSON.stringify(response));		
					res.end();
				});
			});
		});
	});
}


/**
 * We need all incoming requests to work -- so let's just open this thing up. THIS MAY NOT WORK FOR YOUR SETUP.
 */
function _cors(res){
    var headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";
    res.writeHead(200, headers);    
}

http.createServer(route).listen(Config.http.port); // start the server on port 8080


//loop getting status, broadcasts em out




function IsNumeric(input)
{
   return (input - 0) == input && input.length > 0;
}