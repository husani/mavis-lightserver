# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: localhost (MySQL 5.5.29)
# Database: mavis-lightserver
# Generation Time: 2014-04-02 00:28:24 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table group
# ------------------------------------------------------------

DROP TABLE IF EXISTS `group`;

CREATE TABLE `group` (
  `group_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `desc` text,
  PRIMARY KEY (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table light
# ------------------------------------------------------------

DROP TABLE IF EXISTS `light`;

CREATE TABLE `light` (
  `light_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `hue_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `desc` text,
  PRIMARY KEY (`light_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table light_group
# ------------------------------------------------------------

DROP TABLE IF EXISTS `light_group`;

CREATE TABLE `light_group` (
  `light_id` int(11) unsigned NOT NULL,
  `group_id` int(11) unsigned NOT NULL,
  KEY `group_id` (`group_id`),
  KEY `light_id` (`light_id`),
  CONSTRAINT `light_group_ibfk_5` FOREIGN KEY (`light_id`) REFERENCES `light` (`light_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `light_group_ibfk_4` FOREIGN KEY (`group_id`) REFERENCES `group` (`group_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table scene
# ------------------------------------------------------------

DROP TABLE IF EXISTS `scene`;

CREATE TABLE `scene` (
  `scene_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `desc` text,
  PRIMARY KEY (`scene_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table scene_group
# ------------------------------------------------------------

DROP TABLE IF EXISTS `scene_group`;

CREATE TABLE `scene_group` (
  `scene_id` int(11) unsigned NOT NULL,
  `group_id` int(11) unsigned NOT NULL,
  KEY `scene_id` (`scene_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `scene_group_ibfk_1` FOREIGN KEY (`scene_id`) REFERENCES `scene` (`scene_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `scene_group_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `group` (`group_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table scene_light
# ------------------------------------------------------------

DROP TABLE IF EXISTS `scene_light`;

CREATE TABLE `scene_light` (
  `scene_light_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `scene_id` int(11) unsigned DEFAULT NULL,
  `light_id` int(11) unsigned DEFAULT NULL,
  `on` char(1) NOT NULL DEFAULT '',
  `bri` int(11) DEFAULT NULL,
  `hue` int(11) DEFAULT NULL,
  `sat` int(11) DEFAULT NULL,
  `xy_x` decimal(5,4) DEFAULT NULL,
  `xy_y` decimal(5,4) DEFAULT NULL,
  `colormode` enum('hs','ct') DEFAULT NULL,
  PRIMARY KEY (`scene_light_id`),
  KEY `scene_id` (`scene_id`),
  KEY `light_id` (`light_id`),
  CONSTRAINT `scene_light_ibfk_1` FOREIGN KEY (`scene_id`) REFERENCES `scene` (`scene_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `scene_light_ibfk_2` FOREIGN KEY (`light_id`) REFERENCES `light` (`light_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
