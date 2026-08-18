-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 16, 2025 at 12:47 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `qazvin_map`
--
CREATE DATABASE IF NOT EXISTS `qazvin_map` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `qazvin_map`;

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `name`, `lat`, `lng`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Qazvin Bazaar', 36.26880000, 50.00410000, 'Historic bazaar in the heart of Qazvin', '2025-03-25 12:09:36', '2025-03-25 12:09:36'),
(2, 'Chehel Sotoun Palace', 36.26880000, 50.00410000, 'Historic palace with beautiful architecture', '2025-03-25 12:09:36', '2025-03-25 12:09:36'),
(3, 'Qazvin Grand Hotel', 36.26880000, 50.00410000, 'Luxury hotel in downtown Qazvin', '2025-03-25 12:09:36', '2025-03-25 12:09:36'),
(4, 'Qazvin Museum', 36.26880000, 50.00410000, 'Museum showcasing Qazvin history', '2025-03-25 12:09:36', '2025-03-25 12:09:36'),
(5, 'Qazvin Railway Station', 36.26880000, 50.00410000, 'Main railway station of Qazvin', '2025-03-25 12:09:36', '2025-03-25 12:09:36');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
