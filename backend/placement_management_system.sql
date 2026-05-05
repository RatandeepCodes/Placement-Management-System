-- Database initialization script: placement_management_system

CREATE DATABASE IF NOT EXISTS `placement_management_system`;
USE `placement_management_system`;

-- Users table for auth
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('student','admin') NOT NULL DEFAULT 'student'
);

-- Students table
CREATE TABLE IF NOT EXISTS `students` (
  `student_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `roll_no` VARCHAR(100) NOT NULL,
  `branch` VARCHAR(100),
  `cgpa` DECIMAL(4,2),
  `backlogs` INT DEFAULT 0,
  `phone` VARCHAR(20),
  `year` VARCHAR(50),
  `about` TEXT,
  `resume_filename` VARCHAR(255),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `student_resumes` (
  `student_id` INT PRIMARY KEY,
  `resume_data` LONGTEXT,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE CASCADE
);

-- Company table
CREATE TABLE IF NOT EXISTS `companies` (
  `company_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `industry` VARCHAR(255),
  `location` VARCHAR(255),
  `hr_email` VARCHAR(255)
);

-- Jobs table
CREATE TABLE IF NOT EXISTS `jobs` (
  `job_id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `min_cgpa` DECIMAL(4,2),
  `max_backlogs` INT DEFAULT 0,
  `salary` VARCHAR(100),
  `deadline` DATETIME,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`company_id`) ON DELETE CASCADE
);

-- Applications table
CREATE TABLE IF NOT EXISTS `applications` (
  `application_id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `student_name` VARCHAR(255) NOT NULL,
  `job_id` INT NOT NULL,
  `status` VARCHAR(100) DEFAULT 'Applied',
  `applied_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE CASCADE,
  FOREIGN KEY (`job_id`) REFERENCES `jobs`(`job_id`) ON DELETE CASCADE
);

-- Optional seed data
INSERT IGNORE INTO `companies` (`name`,`industry`,`location`,`hr_email`) VALUES
  ('Google','Technology','Mountain View, CA','hr@google.com'),
  ('Microsoft','Technology','Redmond, WA','hr@microsoft.com'),
  ('Amazon','E-Commerce','Seattle, WA','hr@amazon.com'),
  ('Infosys','IT Services','Bengaluru, India','hr@infosys.com'),
  ('TCS','IT Services','Mumbai, India','hr@tcs.com'),
  ('Walmart Labs','Retail Tech','Bengaluru, India','hr@walmartlabs.com'),
  ('Adobe','Software','San Jose, CA','hr@adobe.com'),
  ('Tesla','Automotive','Palo Alto, CA','hr@tesla.com'),
  ('Accenture','Consulting','Dublin, Ireland','hr@accenture.com'),
  ('IBM','Technology','Armonk, NY','hr@ibm.com'),
  ('Spotify','Entertainment','Stockholm, Sweden','hr@spotify.com'),
  ('Uber','Mobility','San Francisco, CA','hr@uber.com'),
  ('Meta','Social Media','Menlo Park, CA','hr@meta.com'),
  ('Salesforce','Cloud','San Francisco, CA','hr@salesforce.com'),
  ('Cisco','Networking','San Jose, CA','hr@cisco.com'),
  ('Intel','Semiconductors','Santa Clara, CA','hr@intel.com'),
  ('SAP','Enterprise','Walldorf, Germany','hr@sap.com'),
  ('Oracle','Database','Austin, TX','hr@oracle.com'),
  ('Shopify','E-Commerce','Ottawa, Canada','hr@shopify.com'),
  ('PayPal','FinTech','San Jose, CA','hr@paypal.com');

INSERT IGNORE INTO `jobs` (`company_id`,`title`,`min_cgpa`,`max_backlogs`,`salary`,`deadline`) VALUES
  (1,'Software Engineer',8.0,0,'₹24 LPA','2026-03-30 23:59:00'),
  (2,'Data Analyst',7.5,1,'₹20 LPA','2026-04-05 18:00:00'),
  (3,'Cloud Engineer',7.0,2,'₹18 LPA','2026-04-10 17:30:00'),
  (4,'Full Stack Developer',7.2,1,'₹16 LPA','2026-04-15 15:00:00'),
  (5,'QA Automation Engineer',7.0,2,'₹14 LPA','2026-04-18 16:00:00'),
  (6,'Data Scientist',8.5,0,'₹26 LPA','2026-04-22 11:59:00'),
  (7,'UI/UX Designer',7.0,2,'₹12 LPA','2026-04-25 14:00:00'),
  (8,'AI Research Intern',9.0,0,'₹30 LPA','2026-04-30 23:59:00'),
  (9,'Business Analyst',7.4,1,'₹15 LPA','2026-05-05 18:30:00'),
  (10,'DevOps Engineer',7.8,1,'₹22 LPA','2026-05-10 17:00:00'),
  (11,'Audio Software Engineer',7.5,1,'₹18 LPA','2026-05-15 17:00:00'),
  (12,'Driver Safety Product Manager',7.2,0,'₹19 LPA','2026-05-20 17:00:00'),
  (13,'Social Media Analyst',7.0,1,'₹15 LPA','2026-05-25 17:00:00'),
  (14,'Customer Success Engineer',7.1,1,'₹17 LPA','2026-05-30 17:00:00'),
  (15,'Network Architect',8.0,0,'₹25 LPA','2026-06-05 17:00:00'),
  (16,'FPGA Design Engineer',8.5,0,'₹28 LPA','2026-06-10 17:00:00'),
  (17,'ERP Consultant',7.6,2,'₹16 LPA','2026-06-15 17:00:00'),
  (18,'Database Engineer',7.4,1,'₹23 LPA','2026-06-20 17:00:00'),
  (19,'Shopify Frontend Developer',7.0,2,'₹14 LPA','2026-06-25 17:00:00'),
  (20,'Payments Backend Engineer',7.8,1,'₹21 LPA','2026-06-30 17:00:00');

