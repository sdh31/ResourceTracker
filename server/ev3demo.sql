-- MySQL dump 10.13  Distrib 5.5.47, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: test_db
-- ------------------------------------------------------
-- Server version	5.5.47-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `permission_group`
--

DROP TABLE IF EXISTS `permission_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permission_group` (
  `group_id` int(11) NOT NULL AUTO_INCREMENT,
  `group_name` varchar(255) DEFAULT NULL,
  `group_description` varchar(255) DEFAULT NULL,
  `user_management_permission` tinyint(1) DEFAULT '0',
  `resource_management_permission` tinyint(1) DEFAULT '0',
  `reservation_management_permission` tinyint(1) DEFAULT '0',
  `is_private` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission_group`
--

LOCK TABLES `permission_group` WRITE;
/*!40000 ALTER TABLE `permission_group` DISABLE KEYS */;
INSERT INTO `permission_group` VALUES (1,'admin_group_110ec58a-a0f2-4ac4-8393-c866d813b8d1','',1,1,1,1),(2,'rs268_group_110ec58a-a0f2-4ac4-8393-c866d813b8d1','',0,0,0,1),(3,'stevehughes_group_110ec58a-a0f2-4ac4-8393-c866d813b8d1','',0,0,0,1),(4,'pranava_group_110ec58a-a0f2-4ac4-8393-c866d813b8d1','',0,0,0,1),(5,'ashwin6_group_110ec58a-a0f2-4ac4-8393-c866d813b8d1','',0,0,0,1),(6,'chrisdee_group_110ec58a-a0f2-4ac4-8393-c866d813b8d1','',0,0,0,1),(7,'ITGroup','undefined',0,0,0,0),(8,'BuildingGroup','undefined',0,0,0,0),(9,'BasicGroup','undefined',0,0,0,0);
/*!40000 ALTER TABLE `permission_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservation`
--

DROP TABLE IF EXISTS `reservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reservation` (
  `reservation_id` int(11) NOT NULL AUTO_INCREMENT,
  `start_time` bigint(20) DEFAULT NULL,
  `end_time` bigint(20) DEFAULT NULL,
  `reservation_title` varchar(255) DEFAULT NULL,
  `reservation_description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`reservation_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservation`
--

LOCK TABLES `reservation` WRITE;
/*!40000 ALTER TABLE `reservation` DISABLE KEYS */;
INSERT INTO `reservation` VALUES (1,1459530000000,1459702800000,'Pranava ECE design project','resources for design project'),(2,1459879200000,1460052000000,'Pranava random work','gotta get things done');
/*!40000 ALTER TABLE `reservation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservation_resource`
--

DROP TABLE IF EXISTS `reservation_resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reservation_resource` (
  `reservation_id` int(11) NOT NULL DEFAULT '0',
  `resource_id` int(11) NOT NULL DEFAULT '0',
  `is_confirmed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`reservation_id`,`resource_id`),
  KEY `resource_id` (`resource_id`),
  CONSTRAINT `reservation_resource_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservation` (`reservation_id`) ON DELETE CASCADE,
  CONSTRAINT `reservation_resource_ibfk_2` FOREIGN KEY (`resource_id`) REFERENCES `resource` (`resource_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservation_resource`
--

LOCK TABLES `reservation_resource` WRITE;
/*!40000 ALTER TABLE `reservation_resource` DISABLE KEYS */;
INSERT INTO `reservation_resource` VALUES (1,1,0),(1,4,0),(1,7,1),(2,2,0),(2,5,0),(2,8,1);
/*!40000 ALTER TABLE `reservation_resource` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource`
--

DROP TABLE IF EXISTS `resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resource` (
  `resource_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `resource_state` enum('free','restricted') DEFAULT 'free',
  `created_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`resource_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource`
--

LOCK TABLES `resource` WRITE;
/*!40000 ALTER TABLE `resource` DISABLE KEYS */;
INSERT INTO `resource` VALUES (1,'Mac001','Macbook Pro','restricted',NULL),(2,'Mac002','Macbook Air','restricted',NULL),(4,'Room001','Can hold 10 people','restricted',NULL),(5,'Room002','can hold 10 people','restricted',NULL),(7,'pencil','','free',NULL),(8,'pen','blue ink','free',NULL);
/*!40000 ALTER TABLE `resource` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource_group`
--

DROP TABLE IF EXISTS `resource_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resource_group` (
  `resource_id` int(11) NOT NULL DEFAULT '0',
  `group_id` int(11) NOT NULL DEFAULT '0',
  `resource_permission` int(11) DEFAULT NULL,
  PRIMARY KEY (`resource_id`,`group_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `resource_group_ibfk_1` FOREIGN KEY (`resource_id`) REFERENCES `resource` (`resource_id`) ON DELETE CASCADE,
  CONSTRAINT `resource_group_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `permission_group` (`group_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource_group`
--

LOCK TABLES `resource_group` WRITE;
/*!40000 ALTER TABLE `resource_group` DISABLE KEYS */;
INSERT INTO `resource_group` VALUES (1,1,10),(1,7,2),(1,9,1),(2,1,10),(2,7,2),(2,9,1),(4,1,10),(4,8,2),(4,9,1),(5,1,10),(5,8,2),(5,9,1),(7,1,10),(7,9,1),(8,1,10),(8,9,1);
/*!40000 ALTER TABLE `resource_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource_tag`
--

DROP TABLE IF EXISTS `resource_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resource_tag` (
  `resource_id` int(11) NOT NULL DEFAULT '0',
  `tag_id` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`resource_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `resource_tag_ibfk_1` FOREIGN KEY (`resource_id`) REFERENCES `resource` (`resource_id`) ON DELETE CASCADE,
  CONSTRAINT `resource_tag_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource_tag`
--

LOCK TABLES `resource_tag` WRITE;
/*!40000 ALTER TABLE `resource_tag` DISABLE KEYS */;
INSERT INTO `resource_tag` VALUES (1,1),(2,1),(4,2),(5,2),(7,3),(8,3);
/*!40000 ALTER TABLE `resource_tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tag`
--

DROP TABLE IF EXISTS `tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tag` (
  `tag_id` int(11) NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(255) NOT NULL,
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `tag_name` (`tag_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag`
--

LOCK TABLES `tag` WRITE;
/*!40000 ALTER TABLE `tag` DISABLE KEYS */;
INSERT INTO `tag` VALUES (1,'computer'),(2,'room'),(3,'writing utensil');
/*!40000 ALTER TABLE `tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `is_shibboleth` tinyint(1) DEFAULT '0',
  `emails_enabled` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin','$2a$10$y0l2O5i0wMS6GkaGVWXP1OcL6Uqapqjc6UQFu3dNrQGgaix9b8Jf2','admin','admin','admin@admin.com',0,1),(2,'rs268','$2a$10$pFcStQSwoC93iJY0CUZG.OIbN9d0b0eGvDj.GQCkSowxHmDCOBbB2','Rahul','Swaminathan','rs268@duke.edu',1,1),(3,'stevehughes','$2a$10$CIu3CXGZD.i9HDyM11BdWeGDo62hQJryH6L1LWrRY1Mlpx.Y2viKe','Stephen','Hughes','stephen.hughes@duke.edu',0,1),(4,'pranava','$2a$10$xrbaZeRSVvklVIUla.Ec5O/u1kXgq61VzmBD0p4PrH/b9UZylVB76','Pranava','Raparla','pkr6@duke.edu',0,1),(5,'ashwin6','$2a$10$tvUJSretjaZ6bqBhcNAxbuLf2GpvXmP10Jmu2L8gcc9vI1lndY6xi','Ashwin','Kommajesula','ashwin.kommajesula@gmail.com',0,1),(6,'chrisdee','$2a$10$baOpO4CRPRCxKURDLVCzJufomlgTy0lZZ54PjG30F8WCIdBmP52Qa','Chris','Dee','cdp16@duke.edu',0,1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_group`
--

DROP TABLE IF EXISTS `user_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_group` (
  `user_id` int(11) NOT NULL DEFAULT '0',
  `group_id` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`,`group_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `user_group_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_group_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `permission_group` (`group_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_group`
--

LOCK TABLES `user_group` WRITE;
/*!40000 ALTER TABLE `user_group` DISABLE KEYS */;
INSERT INTO `user_group` VALUES (1,1),(2,2),(3,3),(4,4),(5,5),(6,6),(2,7),(6,7),(3,8),(4,9),(5,9);
/*!40000 ALTER TABLE `user_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_reservation`
--

DROP TABLE IF EXISTS `user_reservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_reservation` (
  `user_id` int(11) NOT NULL DEFAULT '0',
  `reservation_id` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`,`reservation_id`),
  KEY `reservation_id` (`reservation_id`),
  CONSTRAINT `user_reservation_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_reservation_ibfk_2` FOREIGN KEY (`reservation_id`) REFERENCES `reservation` (`reservation_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_reservation`
--

LOCK TABLES `user_reservation` WRITE;
/*!40000 ALTER TABLE `user_reservation` DISABLE KEYS */;
INSERT INTO `user_reservation` VALUES (4,1),(4,2);
/*!40000 ALTER TABLE `user_reservation` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-03-29 15:23:43
