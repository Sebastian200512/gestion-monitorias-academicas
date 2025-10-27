-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: monitorias
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `cargo` varchar(80) DEFAULT NULL,
  `telefono` varchar(25) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'1128904566','Sebastian Patiño','admin@ucp.edu.co','$2a$10$ScSySpenf2oDlOEQkleHquKxuVJrNq7AWqqjlUyiuUGvQj4DLnoeC','Administrador','3226559570',1,'2025-10-05 19:05:57','2025-10-05 19:24:47');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `admins_v`
--

DROP TABLE IF EXISTS `admins_v`;
/*!50001 DROP VIEW IF EXISTS `admins_v`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `admins_v` AS SELECT 
 1 AS `id`,
 1 AS `codigo`,
 1 AS `nombre_completo`,
 1 AS `correo`,
 1 AS `cargo`,
 1 AS `telefono`,
 1 AS `activo`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `asistencias`
--

DROP TABLE IF EXISTS `asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cita_id` int NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `validada_por_admin` tinyint(1) NOT NULL DEFAULT '0',
  `admin_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cita_id` (`cita_id`),
  KEY `fk_asistencia_admin` (`admin_id`),
  CONSTRAINT `fk_asistencia_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`),
  CONSTRAINT `fk_asistencia_cita` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias`
--

LOCK TABLES `asistencias` WRITE;
/*!40000 ALTER TABLE `asistencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `asistencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estudiante_id` int NOT NULL,
  `monitor_id` int NOT NULL,
  `disponibilidad_id` int DEFAULT NULL,
  `materia_id` int NOT NULL,
  `fecha_cita` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `estado` enum('pendiente','confirmada','completada','cancelada') NOT NULL DEFAULT 'pendiente',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_cita_materia` (`materia_id`),
  KEY `fk_cita_disp` (`disponibilidad_id`),
  KEY `idx_citas_monitor_fecha` (`monitor_id`,`fecha_cita`,`estado`),
  KEY `idx_citas_estudiante_fecha` (`estudiante_id`,`fecha_cita`),
  CONSTRAINT `fk_cita_disp` FOREIGN KEY (`disponibilidad_id`) REFERENCES `disponibilidades` (`id`),
  CONSTRAINT `fk_cita_estudiante` FOREIGN KEY (`estudiante_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_cita_materia` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`),
  CONSTRAINT `fk_cita_monitor` FOREIGN KEY (`monitor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `chk_cita_horas` CHECK ((`hora_inicio` < `hora_fin`))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
INSERT INTO `citas` VALUES (1,1,2,5,2,'2025-10-16','08:00:00','10:00:00',NULL,'cancelada','2025-10-07 21:50:10'),(2,1,2,5,2,'2025-10-16','08:00:00','10:00:00',NULL,'pendiente','2025-10-14 19:19:25');
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disponibilidades`
--

DROP TABLE IF EXISTS `disponibilidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disponibilidades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `monitor_id` int NOT NULL,
  `materia_id` int NOT NULL,
  `dia` enum('Lunes','Martes','Miercoles','Jueves','Viernes') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `estado` enum('Activa','Inactiva','Cerrada') NOT NULL DEFAULT 'Activa',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_disp_materia` (`materia_id`),
  KEY `idx_disponibilidades_monitor_fecha` (`monitor_id`),
  CONSTRAINT `fk_disp_materia` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`),
  CONSTRAINT `fk_disp_monitor` FOREIGN KEY (`monitor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `chk_disp_horas` CHECK ((`hora_inicio` < `hora_fin`))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilidades`
--

LOCK TABLES `disponibilidades` WRITE;
/*!40000 ALTER TABLE `disponibilidades` DISABLE KEYS */;
INSERT INTO `disponibilidades` VALUES (5,2,2,'Jueves','08:00:00','10:00:00','Aula 205','Activa','2025-10-07 20:06:24'),(7,2,1,'Martes','11:00:00','14:00:00','Aula 204','Activa','2025-10-07 20:19:05'),(8,2,6,'Miercoles','09:00:00','11:00:00','Aula 201','Activa','2025-10-14 19:15:12');
/*!40000 ALTER TABLE `disponibilidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `disponibilidades_v`
--

DROP TABLE IF EXISTS `disponibilidades_v`;
/*!50001 DROP VIEW IF EXISTS `disponibilidades_v`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `disponibilidades_v` AS SELECT 
 1 AS `id`,
 1 AS `dia`,
 1 AS `hora_inicio`,
 1 AS `hora_fin`,
 1 AS `estado`,
 1 AS `monitor_id`,
 1 AS `monitor`,
 1 AS `materia_id`,
 1 AS `materia`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `materias`
--

DROP TABLE IF EXISTS `materias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `creditos` tinyint unsigned DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materias`
--

LOCK TABLES `materias` WRITE;
/*!40000 ALTER TABLE `materias` DISABLE KEYS */;
INSERT INTO `materias` VALUES (1,'MATEMÁTICAS I','090146',6,'Activo'),(2,'DESARROLLO HUMANO','090162',2,'Activo'),(3,'DEPORTES','271101',1,'Activo'),(4,'DESARROLLO DE SOFTWARE I','150103',4,'Activo'),(5,'INTRODUCCIÓN A LA TECNOLOGÍA','150101',3,'Activo'),(6,'MATEMÁTICAS II','090264',4,'Activo'),(7,'DIÁLOGO FE Y CULTURA','090182',2,'Activo'),(8,'EXPRESIÓN ORAL Y ESCRITA','090083',2,'Activo'),(9,'DESARROLLO DE SOFTWARE II','150201',4,'Activo'),(10,'ELECTIVA I','150202',2,'Activo'),(11,'ÁLGEBRA LINEAL','090173',3,'Activo'),(12,'FÍSICA','090233',3,'Activo'),(13,'ADMINISTRACIÓN Y EMPRESARISMO','090300',3,'Activo'),(14,'DESARROLLO DE SOFTWARE III','150301',4,'Activo'),(15,'BASES DE DATOS I','150303',3,'Activo'),(16,'ESTADÍSTICA I','090194',4,'Activo'),(17,'OPTATIVA I','150403',3,'Activo'),(18,'GESTIÓN DE TECNOLOGÍA','150503',3,'Activo'),(19,'BASES DE DATOS II','150504',4,'Activo'),(20,'INVESTIGACIÓN EN TECNOLOGÍA','150503A',2,'Activo'),(21,'OPTATIVA II','150603',3,'Activo'),(22,'FORMULACIÓN Y EVALUACIÓN DE PROYECTOS','150502',3,'Activo'),(23,'REDES DE COMPUTADORES','150404',4,'Activo'),(24,'ELECTIVA II','150402',2,'Activo'),(25,'TRABAJO FINAL','150703',4,'Activo'),(26,'OPTATIVA III','150803',3,'Activo'),(27,'ÉTICA','091142',2,'Activo');
/*!40000 ALTER TABLE `materias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ESTUDIANTE'),(2,'MONITOR');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_rol`
--

DROP TABLE IF EXISTS `usuario_rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_rol` (
  `usuario_id` int NOT NULL,
  `rol_id` int NOT NULL,
  `asignado_por_admin` int DEFAULT NULL,
  `asignado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usuario_id`,`rol_id`),
  KEY `fk_ur_rol` (`rol_id`),
  KEY `fk_ur_admin` (`asignado_por_admin`),
  CONSTRAINT `fk_ur_admin` FOREIGN KEY (`asignado_por_admin`) REFERENCES `admins` (`id`),
  CONSTRAINT `fk_ur_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `fk_ur_user` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_rol`
--

LOCK TABLES `usuario_rol` WRITE;
/*!40000 ALTER TABLE `usuario_rol` DISABLE KEYS */;
INSERT INTO `usuario_rol` VALUES (1,1,1,'2025-10-05 19:35:03'),(1,2,1,'2025-10-14 19:35:40'),(2,1,1,'2025-10-05 19:36:59'),(2,2,1,'2025-10-05 19:36:59');
/*!40000 ALTER TABLE `usuario_rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `programa` varchar(100) DEFAULT NULL,
  `semestre` tinyint unsigned DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'2023100178','Juan Pérez','juan.perez@ucp.edu.co','$2b$10$4CGeEneg1lO1qOWWT6HFROMc9IT6RaKxbWc5Ocj6Wk5zZU84cQHfm','Ingeniería de Sistemas',5,1,'2025-10-05 19:35:03','2025-10-05 21:03:51'),(2,'2023100236','María Gómez','maria.gomez@ucp.edu.co','$2a$10$45NtnBICbZIRbgOwjVnEg.AjhQ6ypwTQ6NPkAFi/5vLfnhC5qkzum','Ingeniería de Sistemas',6,1,'2025-10-05 19:36:46','2025-10-05 19:36:46');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `admins_v`
--

/*!50001 DROP VIEW IF EXISTS `admins_v`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `admins_v` AS select `a`.`id` AS `id`,`a`.`codigo` AS `codigo`,`a`.`nombre_completo` AS `nombre_completo`,`a`.`correo` AS `correo`,`a`.`cargo` AS `cargo`,`a`.`telefono` AS `telefono`,`a`.`activo` AS `activo`,`a`.`created_at` AS `created_at` from `admins` `a` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `disponibilidades_v`
--

/*!50001 DROP VIEW IF EXISTS `disponibilidades_v`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY INVOKER */
/*!50001 VIEW `disponibilidades_v` AS select `d`.`id` AS `id`,`d`.`dia` AS `dia`,`d`.`hora_inicio` AS `hora_inicio`,`d`.`hora_fin` AS `hora_fin`,`d`.`estado` AS `estado`,`u`.`id` AS `monitor_id`,`u`.`nombre_completo` AS `monitor`,`m`.`id` AS `materia_id`,`m`.`nombre` AS `materia` from ((`disponibilidades` `d` join `usuarios` `u` on((`u`.`id` = `d`.`monitor_id`))) join `materias` `m` on((`m`.`id` = `d`.`materia_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-18 16:55:16
