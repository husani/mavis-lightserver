var Config = {};

/** LOGGING */
Config.logging = {};
Config.logging.log_file_directory = "./logs/";
Config.logging.filename = "lightserver.log";

/** DATABASE */
Config.database = {};
Config.database.host = "localhost";
Config.database.user = "mavis";
Config.database.password = "mavis";
Config.database.database = "mavis-lightserver";

/** HTTP SERVER/ROUTES */
Config.http = {};
Config.http.port = "8000";

/** HUE */
Config.hue = {};
Config.hue.bridge_ip = "10.0.1.6";
Config.hue.bridge_username = "mavis-stickyhue";

module.exports = Config;