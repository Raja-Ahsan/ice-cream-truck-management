-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Feb 06, 2026 at 05:09 PM
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
-- Database: `ice_cream_truck`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `subject_type` varchar(255) DEFAULT NULL,
  `subject_id` bigint(20) UNSIGNED DEFAULT NULL,
  `properties` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`properties`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `subject_type`, `subject_id`, `properties`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(1, 1, 'login', NULL, NULL, '{\"ip\":\"127.0.0.1\"}', '127.0.0.1', 'Mozilla/5.0 (Dummy)', '2026-01-30 01:32:38', '2026-01-30 14:32:38'),
(2, 1, 'booking.viewed', 'App\\Models\\Booking', 1, '{\"booking_uuid\":\"cc12e9d3-4d92-4e23-9323-1034cec2e6c7\"}', '127.0.0.1', 'Mozilla/5.0 (Dummy)', '2026-01-29 18:32:38', '2026-01-30 14:32:38'),
(3, 1, 'booking.assigned', 'App\\Models\\Booking', 1, '{\"truck_id\":1,\"driver_id\":1}', '127.0.0.1', 'Mozilla/5.0 (Dummy)', '2026-01-30 13:32:38', '2026-01-30 14:32:38'),
(4, 1, 'inventory.reviewed', 'App\\Models\\TruckInventorySnapshot', 4, '{\"booking_id\":11,\"status\":\"approved\",\"discrepancies\":[{\"line_id\":8,\"product_id\":2,\"discrepancy\":-1},{\"line_id\":10,\"product_id\":1,\"discrepancy\":-2}],\"note\":null}', NULL, NULL, '2026-02-06 10:58:45', '2026-02-06 10:58:45');

-- --------------------------------------------------------

--
-- Table structure for table `add_ons`
--

CREATE TABLE `add_ons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `add_ons`
--

INSERT INTO `add_ons` (`id`, `name`, `price`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Extra Scoops', 25.00, 1, '2026-01-30 14:32:33', '2026-01-30 14:32:33'),
(2, 'Birthday Banner', 15.00, 1, '2026-01-30 14:32:33', '2026-01-30 14:32:33'),
(3, 'Photo Booth', 50.00, 1, '2026-01-30 14:32:33', '2026-01-30 14:32:33');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` char(36) NOT NULL,
  `event_date` date NOT NULL,
  `event_time` time NOT NULL,
  `duration_minutes` int(10) UNSIGNED NOT NULL,
  `package_id` bigint(20) UNSIGNED NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `event_address` text NOT NULL,
  `special_notes` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `payment_status` varchar(255) NOT NULL DEFAULT 'pending',
  `stripe_payment_intent_id` varchar(255) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `truck_id` bigint(20) UNSIGNED DEFAULT NULL,
  `driver_id` bigint(20) UNSIGNED DEFAULT NULL,
  `dispatched_at` timestamp NULL DEFAULT NULL,
  `arrived_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `uuid`, `event_date`, `event_time`, `duration_minutes`, `package_id`, `customer_name`, `customer_phone`, `customer_email`, `event_address`, `special_notes`, `status`, `payment_status`, `stripe_payment_intent_id`, `total_amount`, `truck_id`, `driver_id`, `dispatched_at`, `arrived_at`, `completed_at`, `created_at`, `updated_at`) VALUES
(1, 'cc12e9d3-4d92-4e23-9323-1034cec2e6c7', '2026-02-04', '14:00:00', 60, 1, 'Alice Smith', '555-2001', 'alice@example.com', '456 Party Lane, Downtown', 'Birthday party for 10 kids', 'pending', 'pending', NULL, 199.00, NULL, NULL, NULL, NULL, NULL, '2026-01-30 14:32:36', '2026-01-30 14:32:36'),
(2, '7ffbf867-16ff-4c75-93c7-cbf27dcbc177', '2026-02-06', '16:00:00', 120, 2, 'Bob Johnson', '555-2002', 'bob@example.com', '789 Park Ave, Metro Area', NULL, 'confirmed', 'paid', NULL, 389.00, NULL, NULL, NULL, NULL, NULL, '2026-01-30 14:32:36', '2026-01-30 14:32:36'),
(3, '5501b63d-70b3-4971-820a-5b9e609287dc', '2026-02-09', '11:00:00', 60, 1, 'Carol Williams', '555-2003', 'carol@example.com', '321 School Rd', 'School event', 'assigned', 'paid', NULL, 199.00, 1, 2, '2026-01-30 15:59:23', NULL, NULL, '2026-01-30 14:32:37', '2026-01-30 15:59:40'),
(4, 'e3892edd-7d10-4273-a036-e7098a1e1bee', '2026-02-02', '13:00:00', 120, 2, 'Dave Brown', '555-2004', 'dave@example.com', '100 Main St', NULL, 'dispatched', 'paid', NULL, 349.00, 1, 2, '2026-01-30 15:51:54', NULL, NULL, '2026-01-30 14:32:37', '2026-01-30 15:51:54'),
(5, '3f0ae601-7ba9-4730-90e9-ae2eef468e48', '2026-01-28', '15:00:00', 60, 1, 'Eve Davis', '555-2005', 'eve@example.com', '555 Past Lane', NULL, 'completed', 'paid', NULL, 224.00, 1, 2, '2026-01-28 09:00:00', NULL, '2026-01-28 11:05:00', '2026-01-30 14:32:37', '2026-01-30 14:32:37'),
(6, '1901cb4f-4c5b-4053-9d37-c5fbc5b334ae', '2026-02-11', '14:00:00', 60, 1, 'Alice Smith', '555-2001', 'alice@example.com', '456 Party Lane, Downtown', 'Birthday party for 10 kids', 'pending', 'pending', NULL, 199.00, NULL, NULL, NULL, NULL, NULL, '2026-02-06 09:05:12', '2026-02-06 09:05:12'),
(7, 'e6e2e1fe-2158-4ba5-9cb4-08af41317e56', '2026-02-13', '16:00:00', 120, 2, 'Bob Johnson', '555-2002', 'bob@example.com', '789 Park Ave, Metro Area', NULL, 'confirmed', 'paid', NULL, 389.00, NULL, NULL, NULL, NULL, NULL, '2026-02-06 09:05:12', '2026-02-06 09:05:12'),
(8, 'b1b4fc72-e700-4b73-9c8b-a54e6eae899e', '2026-02-16', '11:00:00', 60, 1, 'Carol Williams', '555-2003', 'carol@example.com', '321 School Rd', 'School event', 'assigned', 'paid', NULL, 199.00, 1, 2, NULL, NULL, NULL, '2026-02-06 09:05:13', '2026-02-06 09:05:13'),
(9, '591fb6a2-c458-433b-9a1d-95876f07652b', '2026-02-09', '13:00:00', 120, 2, 'Dave Brown', '555-2004', 'dave@example.com', '100 Main St', NULL, 'dispatched', 'paid', NULL, 349.00, 2, 3, '2026-02-06 09:05:11', NULL, NULL, '2026-02-06 09:05:13', '2026-02-06 09:05:13'),
(10, '10df5548-8163-4097-9525-77e27b55d19f', '2026-02-04', '15:00:00', 60, 1, 'Eve Davis', '555-2005', 'eve@example.com', '555 Past Lane', NULL, 'completed', 'paid', NULL, 224.00, 1, 2, '2026-02-04 09:00:00', NULL, '2026-02-04 11:05:00', '2026-02-06 09:05:13', '2026-02-06 09:05:13'),
(11, '83b3c205-498b-4b93-84da-16f4fdb1e646', '2026-02-11', '14:00:00', 60, 1, 'Alice Smith', '555-2001', 'alice@example.com', '456 Party Lane, Downtown', 'Birthday party for 10 kids', 'completed', 'pending', NULL, 199.00, 2, 3, '2026-02-06 10:50:56', '2026-02-06 10:53:15', '2026-02-06 10:54:30', '2026-02-06 09:05:38', '2026-02-06 10:54:30'),
(12, '70fdc065-c5c5-4130-b7b9-25abcf5b1ff8', '2026-02-13', '16:00:00', 120, 2, 'Bob Johnson', '555-2002', 'bob@example.com', '789 Park Ave, Metro Area', NULL, 'confirmed', 'paid', NULL, 389.00, NULL, NULL, NULL, NULL, NULL, '2026-02-06 09:05:38', '2026-02-06 09:05:38'),
(13, '87cca583-a55a-41ed-ae81-df8cd84b514a', '2026-02-16', '11:00:00', 60, 1, 'Carol Williams', '555-2003', 'carol@example.com', '321 School Rd', 'School event', 'completed', 'paid', NULL, 199.00, 1, 2, '2026-02-06 09:55:42', '2026-02-06 10:16:15', '2026-02-06 10:26:14', '2026-02-06 09:05:39', '2026-02-06 10:26:14'),
(14, '7c8a4574-9383-4303-ad71-39fd14a75fe8', '2026-02-09', '13:00:00', 120, 2, 'Dave Brown', '555-2004', 'dave@example.com', '100 Main St', NULL, 'dispatched', 'paid', NULL, 349.00, 2, 3, '2026-02-06 09:05:38', NULL, NULL, '2026-02-06 09:05:39', '2026-02-06 09:05:39'),
(15, '09ebfc48-c7ba-4907-a662-08e874f82fac', '2026-02-04', '15:00:00', 60, 1, 'Eve Davis', '555-2005', 'eve@example.com', '555 Past Lane', NULL, 'completed', 'paid', NULL, 224.00, 1, 2, '2026-02-04 09:00:00', NULL, '2026-02-04 11:05:00', '2026-02-06 09:05:39', '2026-02-06 09:05:39');

-- --------------------------------------------------------

--
-- Table structure for table `booking_add_ons`
--

CREATE TABLE `booking_add_ons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `add_on_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `price_snapshot` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking_add_ons`
--

INSERT INTO `booking_add_ons` (`id`, `booking_id`, `add_on_id`, `quantity`, `price_snapshot`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 1, 25.00, '2026-01-30 14:32:36', '2026-01-30 14:32:36'),
(2, 2, 2, 1, 15.00, '2026-01-30 14:32:37', '2026-01-30 14:32:37'),
(3, 5, 1, 1, 25.00, '2026-01-30 14:32:37', '2026-01-30 14:32:37'),
(4, 7, 1, 1, 25.00, '2026-02-06 09:05:12', '2026-02-06 09:05:12'),
(5, 7, 2, 1, 15.00, '2026-02-06 09:05:13', '2026-02-06 09:05:13'),
(6, 10, 1, 1, 25.00, '2026-02-06 09:05:13', '2026-02-06 09:05:13'),
(7, 12, 1, 1, 25.00, '2026-02-06 09:05:38', '2026-02-06 09:05:38'),
(8, 12, 2, 1, 15.00, '2026-02-06 09:05:39', '2026-02-06 09:05:39'),
(9, 15, 1, 1, 25.00, '2026-02-06 09:05:39', '2026-02-06 09:05:39');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cms_pages`
--

CREATE TABLE `cms_pages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` longtext DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cms_pages`
--

INSERT INTO `cms_pages` (`id`, `slug`, `title`, `content`, `meta_title`, `meta_description`, `published_at`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'home', 'Welcome', '<p>Book our ice cream truck for your next event!</p>', 'Ice Cream Truck | Book Now', 'Book an ice cream truck for parties and events.', '2026-01-30 14:32:33', 1, '2026-01-30 14:32:33', '2026-01-30 14:32:33'),
(2, 'pricing', 'Pricing', '<p>Transparent pricing for all packages.</p>', 'Pricing', 'Ice cream truck pricing and packages.', '2026-01-30 14:32:33', 2, '2026-01-30 14:32:34', '2026-01-30 14:32:34'),
(3, 'faqs', 'FAQs', '<p>Frequently asked questions.</p>', 'FAQs', 'Common questions about our service.', '2026-01-30 14:32:33', 3, '2026-01-30 14:32:34', '2026-01-30 14:32:34');

-- --------------------------------------------------------

--
-- Table structure for table `driver_locations`
--

CREATE TABLE `driver_locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `booking_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `driver_locations`
--

INSERT INTO `driver_locations` (`id`, `user_id`, `latitude`, `longitude`, `recorded_at`, `booking_id`, `created_at`, `updated_at`) VALUES
(1, 2, 40.7073000, -74.0024000, '2026-01-30 14:21:37', 3, '2026-01-30 14:32:37', '2026-01-30 14:32:37'),
(2, 2, 40.7152000, -74.0004000, '2026-01-30 13:59:37', 3, '2026-01-30 14:32:37', '2026-01-30 14:32:37'),
(3, 3, 40.7209000, -74.0070000, '2026-01-30 14:18:37', 3, '2026-01-30 14:32:38', '2026-01-30 14:32:38'),
(4, 3, 40.7071000, -74.0123000, '2026-01-30 13:56:38', 3, '2026-01-30 14:32:38', '2026-01-30 14:32:38');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `question` text NOT NULL,
  `answer` longtext NOT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faqs`
--

INSERT INTO `faqs` (`id`, `question`, `answer`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'How far in advance should I book?', 'We recommend booking at least 2 weeks in advance for weekend events.', 1, 1, '2026-01-30 14:32:34', '2026-01-30 14:32:34'),
(2, 'What areas do you serve?', 'Enter your ZIP code on our website to check if we serve your area.', 2, 1, '2026-01-30 14:32:34', '2026-01-30 14:32:34'),
(3, 'What payment methods do you accept?', 'We accept all major credit cards securely through our booking system.', 3, 1, '2026-01-30 14:32:34', '2026-01-30 14:32:34'),
(4, 'Can I cancel or reschedule?', 'Yes. Contact us at least 48 hours before the event for rescheduling. Cancellation policy applies.', 4, 1, '2026-01-30 14:32:34', '2026-01-30 14:32:34');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_products`
--

CREATE TABLE `inventory_products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL DEFAULT 'unit',
  `image` varchar(255) DEFAULT NULL,
  `quantity_in_stock` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_products`
--

INSERT INTO `inventory_products` (`id`, `name`, `unit`, `image`, `quantity_in_stock`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Wall\'s Ice Cream Cup Mango 100m', 'Cup', 'inventory-products/LVxXpgHbL7HIvIdQoNRysI9q5XYxhP1MnAUasrZk.webp', 198, 1, '2026-01-30 14:32:35', '2026-02-06 10:58:45'),
(2, 'Scottish Tablet Ice Cream', 'tub', 'inventory-products/4TrlJXChMrVWo7BL2oNZmYRD2x3M8EV8r2jn2RIM.webp', 101, 1, '2026-01-30 14:32:35', '2026-02-06 10:58:45'),
(3, 'Strawberry ice cream', 'unit', 'inventory-products/fFY7Sen3ZIpxel3H9hj4WrtOEQr3ItKa32bKIh7x.jpg', 495, 1, '2026-01-30 16:26:31', '2026-02-06 10:58:45');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `queue`, `payload`, `attempts`, `reserved_at`, `available_at`, `created_at`) VALUES
(1, 'default', '{\"uuid\":\"c54fb6e4-9e62-44c1-96d2-cc7d55fb99dd\",\"displayName\":\"App\\\\Jobs\\\\NotifyDriverAssignedJob\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"App\\\\Jobs\\\\NotifyDriverAssignedJob\",\"command\":\"O:32:\\\"App\\\\Jobs\\\\NotifyDriverAssignedJob\\\":1:{s:7:\\\"booking\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:18:\\\"App\\\\Models\\\\Booking\\\";s:2:\\\"id\\\";i:3;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}\"},\"createdAt\":1769803879,\"delay\":null}', 0, NULL, 1769803879, 1769803879),
(2, 'default', '{\"uuid\":\"b61bdace-56d9-41a8-a351-f4fa2adf4f7e\",\"displayName\":\"App\\\\Jobs\\\\NotifyDriverAssignedJob\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"App\\\\Jobs\\\\NotifyDriverAssignedJob\",\"command\":\"O:32:\\\"App\\\\Jobs\\\\NotifyDriverAssignedJob\\\":1:{s:7:\\\"booking\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:18:\\\"App\\\\Models\\\\Booking\\\";s:2:\\\"id\\\";i:4;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}\"},\"createdAt\":1769806300,\"delay\":null}', 0, NULL, 1769806300, 1769806300),
(3, 'default', '{\"uuid\":\"473773a6-7406-46dc-be37-1a88b663e480\",\"displayName\":\"App\\\\Jobs\\\\NotifyDriverAssignedJob\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"App\\\\Jobs\\\\NotifyDriverAssignedJob\",\"command\":\"O:32:\\\"App\\\\Jobs\\\\NotifyDriverAssignedJob\\\":1:{s:7:\\\"booking\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:18:\\\"App\\\\Models\\\\Booking\\\";s:2:\\\"id\\\";i:3;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}\"},\"createdAt\":1769806780,\"delay\":null}', 0, NULL, 1769806780, 1769806780),
(4, 'default', '{\"uuid\":\"43539c71-90f8-4ff2-9bd3-2802233fd7d0\",\"displayName\":\"App\\\\Jobs\\\\TriggerInventoryReviewJob\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"App\\\\Jobs\\\\TriggerInventoryReviewJob\",\"command\":\"O:34:\\\"App\\\\Jobs\\\\TriggerInventoryReviewJob\\\":1:{s:7:\\\"booking\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:18:\\\"App\\\\Models\\\\Booking\\\";s:2:\\\"id\\\";i:13;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}\"},\"createdAt\":1770391574,\"delay\":null}', 0, NULL, 1770391574, 1770391574),
(5, 'default', '{\"uuid\":\"38e6f0f0-86ea-42cf-9e6b-b4d615d8706a\",\"displayName\":\"App\\\\Jobs\\\\NotifyDriverAssignedJob\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"App\\\\Jobs\\\\NotifyDriverAssignedJob\",\"command\":\"O:32:\\\"App\\\\Jobs\\\\NotifyDriverAssignedJob\\\":1:{s:7:\\\"booking\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:18:\\\"App\\\\Models\\\\Booking\\\";s:2:\\\"id\\\";i:11;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}\"},\"createdAt\":1770392797,\"delay\":null}', 0, NULL, 1770392797, 1770392797),
(6, 'default', '{\"uuid\":\"543790e2-5f78-45fa-8e27-95826353040b\",\"displayName\":\"App\\\\Jobs\\\\TriggerInventoryReviewJob\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"App\\\\Jobs\\\\TriggerInventoryReviewJob\",\"command\":\"O:34:\\\"App\\\\Jobs\\\\TriggerInventoryReviewJob\\\":1:{s:7:\\\"booking\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:18:\\\"App\\\\Models\\\\Booking\\\";s:2:\\\"id\\\";i:11;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}\"},\"createdAt\":1770393271,\"delay\":null}', 0, NULL, 1770393271, 1770393271);

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_01_30_099999_create_personal_access_tokens_table', 1),
(5, '2025_01_30_100000_add_role_phone_to_users_table', 1),
(6, '2025_01_30_100001_create_service_areas_table', 1),
(7, '2025_01_30_100002_create_packages_table', 1),
(8, '2025_01_30_100003_create_add_ons_table', 1),
(9, '2025_01_30_100004_create_trucks_table', 1),
(10, '2025_01_30_100005_create_cms_pages_table', 1),
(11, '2025_01_30_100006_create_faqs_table', 1),
(12, '2025_01_30_100007_create_bookings_table', 1),
(13, '2025_01_30_100008_create_booking_add_ons_table', 1),
(14, '2025_01_30_100009_create_inventory_products_table', 1),
(15, '2025_01_30_100010_create_truck_inventory_snapshots_table', 1),
(16, '2025_01_30_100011_create_driver_locations_table', 1),
(17, '2025_01_30_100012_create_activity_logs_table', 1),
(18, '2025_01_30_200000_create_settings_table', 1),
(19, '2025_01_30_300000_add_inventory_review_and_global_stock', 2),
(20, '2025_01_30_400000_add_avatar_to_users_table', 3),
(21, '2025_01_30_500000_add_image_to_inventory_products_table', 4),
(22, '2025_01_30_600000_add_image_and_description_to_trucks_table', 5),
(23, '2025_01_30_700000_add_truck_number_model_capacity_to_trucks_table', 6),
(24, '2025_01_30_800000_add_license_to_users_table', 7),
(25, '2025_01_30_900000_add_arrived_at_to_bookings_table', 8),
(26, '2025_01_30_950000_add_quantity_waste_to_truck_inventory_snapshot_lines', 9);

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_minutes` int(10) UNSIGNED NOT NULL DEFAULT 60,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`id`, `name`, `description`, `price`, `duration_minutes`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Basic Party', '1 hour of ice cream fun', 199.00, 60, 1, 1, '2026-01-30 14:32:33', '2026-01-30 14:32:33'),
(2, 'Premium Party', '2 hours with extra treats', 349.00, 120, 2, 1, '2026-01-30 14:32:33', '2026-01-30 14:32:33');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'api', '7bac4342d1c908f056e91cdddf1fe8c008c5388cdda662b5344cbaa75a44e5e8', '[\"*\"]', '2026-01-30 15:12:26', NULL, '2026-01-30 14:52:35', '2026-01-30 15:12:26'),
(2, 'App\\Models\\User', 1, 'api', 'b46c3fc332ae75936ed374c1c9d21d6ea1a6e1846e56ad7c866ce9a8b531a625', '[\"*\"]', '2026-01-30 18:19:31', NULL, '2026-01-30 15:12:29', '2026-01-30 18:19:31'),
(3, 'App\\Models\\User', 1, 'api', '0bedf0798e88907249ca20a7e9ac37aa77b88ff3c095c9af2d2346f171ab6b7c', '[\"*\"]', '2026-02-06 09:11:22', NULL, '2026-02-06 08:38:20', '2026-02-06 09:11:22'),
(4, 'App\\Models\\User', 2, 'api', 'c393470e79b714ff3c96598cc56693698a90f2d78040682c152f948a16d67c50', '[\"*\"]', NULL, NULL, '2026-02-06 09:14:06', '2026-02-06 09:14:06'),
(5, 'App\\Models\\User', 2, 'api', '532f40e1644f29552baede3c2703c33c65378199312bbcb0a9bc9c06b4d3f619', '[\"*\"]', '2026-02-06 09:52:54', NULL, '2026-02-06 09:18:30', '2026-02-06 09:52:54'),
(6, 'App\\Models\\User', 1, 'api', 'd7020079b4114c724fcc0f0ccee8144bb83d49aeb420d918d62bba8fb98e8b93', '[\"*\"]', '2026-02-06 10:00:16', NULL, '2026-02-06 09:54:52', '2026-02-06 10:00:16'),
(7, 'App\\Models\\User', 2, 'api', '2b93149d67e26c1446ac92b00e35fcc090485064ebb74793defcf0c27dc69e2f', '[\"*\"]', '2026-02-06 10:38:58', NULL, '2026-02-06 10:04:41', '2026-02-06 10:38:58'),
(8, 'App\\Models\\User', 1, 'api', '9a5ba2d2b55bf7d7a2c4f5e93bcc7b8773e3fea2aa04375340fec8a7d2ada4ae', '[\"*\"]', '2026-02-06 10:43:59', NULL, '2026-02-06 10:32:46', '2026-02-06 10:43:59'),
(9, 'App\\Models\\User', 1, 'api', '386db36094780506d042ed1c784d849ba6479c751f83e67f4a19f92287a9743a', '[\"*\"]', '2026-02-06 11:03:06', NULL, '2026-02-06 10:44:23', '2026-02-06 11:03:06'),
(10, 'App\\Models\\User', 3, 'api', '38f6e653c802fe06139d52e7c2157eae50afc2b7757b1d7d9adb7ba4341d889e', '[\"*\"]', '2026-02-06 10:57:16', NULL, '2026-02-06 10:51:56', '2026-02-06 10:57:16');

-- --------------------------------------------------------

--
-- Table structure for table `service_areas`
--

CREATE TABLE `service_areas` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `center_lat` decimal(10,7) DEFAULT NULL,
  `center_lng` decimal(10,7) DEFAULT NULL,
  `radius_km` int(10) UNSIGNED NOT NULL DEFAULT 25,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `service_areas`
--

INSERT INTO `service_areas` (`id`, `name`, `zip_code`, `center_lat`, `center_lng`, `radius_km`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Downtown', '10001', NULL, NULL, 15, 1, '2026-01-30 14:32:32', '2026-01-30 14:32:32'),
(2, 'Metro Area', '10002', NULL, NULL, 25, 1, '2026-01-30 14:32:32', '2026-01-30 14:32:32'),
(3, 'West Side', '10003', NULL, NULL, 20, 1, '2026-01-30 14:32:33', '2026-01-30 14:32:33');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('04e0uhdrYrJcaDM8k9g9lSxb3IJMCy0lBk1YywQ5', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicUtNd05qdFhMZE51dWE1Z2dUMWs3ZUpnOEJsZzNZb1NuNHFMZjdkNyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvdjEvbG9naW4iO3M6NToicm91dGUiO3M6Mzoic3BhIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770387757),
('0Dbx4k1FwwPFbmoJaD3o8IPpDZgflh6F9NlSFsQq', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT0FNNmxsQlpmR1dxQjZqZGZObGQ0TDBqcE5BZFpmQnJXellncW1RTiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvdjEvbG9naW4iO3M6NToicm91dGUiO3M6Mzoic3BhIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770387755),
('83x4N5d8xDASktOxCuU7iTN59pbSz34flVtq5xfM', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibGEwdU43emo2WEF2QUkzTTBVeW9wclNvc2YwTHo2dm9QUDhQc3ZnaSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvdjEvbG9naW4iO3M6NToicm91dGUiO3M6Mzoic3BhIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770387882),
('bcDfooZ6RQMzQHPbVUnPMlRBh599yXyavfc78TGn', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoia2RaTVpkSVpBZGFVWkZ6Q0h6aERWdU5xZHFtQTJYdzhpTVRpQ29pNSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvdjEvbG9naW4iO3M6NToicm91dGUiO3M6Mzoic3BhIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770387896),
('BE8L6GRQfTneGTtI5JM5nWZnbsaIrPllZ5ZeGFYP', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT1l3cmZvZlpqZWg4OUJhQjZESVpoTGlaVzdtSVVxRkQ5cXRENzlhayI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvdjEvbG9naW4iO3M6NToicm91dGUiO3M6Mzoic3BhIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770387881),
('CIZ7oEZ10GAhpiQ2z7TeMkKZd5S10OEMAW4DY4XF', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZm1iV1JOb2VjYVNCVUxBbHVrdEZwOHVodVo5aE9hWVRmd0d0UVdCSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7czozOiJzcGEiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1770393838),
('HHgx1LtlSLtajq7lzuYt8Qod9a6MBlmohGeZzNnq', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicTlEMnhoZ2Zpa2RMQ0hSNkZRcW9QNVp6ak9pUU5MTEZERHNFQ0RLOSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvdjEvbG9naW4iO3M6NToicm91dGUiO3M6Mzoic3BhIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770387791),
('IINHIGzTtzb0D0tcs4e9jdYXgqYo9lbU4z8wbjx3', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVmViTWRnbDFieWp1YlBpWWtjWEhKSExwT2IwejlpU1hzdThlbnNPUCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvdjEvbG9naW4iO3M6NToicm91dGUiO3M6Mzoic3BhIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770387897),
('j3QAW5XxbqwQeldIUXixUeY3s4I2j7Webh46V92X', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaUp3ZVhUaWxFR0hiejVkV1Bvdlh5Zlc1VmFVWVRud0tqM2NNbFg1RiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvdjEvbG9naW4iO3M6NToicm91dGUiO3M6Mzoic3BhIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770387898),
('MJJh2vBvBWyXkN7qG380GAVP0nYA1zYWPhoNC9Ap', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTXl1SEd0Q1R1WEFMVjhMbVZpT2dibUpMTGw1RHZYbjVlemxYVnNrZSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvdjEvbG9naW4iO3M6NToicm91dGUiO3M6Mzoic3BhIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770387758),
('rdkhm3fcCeQgx8acCAduuIsUEsVzktRqtA1SmokO', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVDNsSlJiUGxIWGM3U3ExbnVZU0tBc1FadVloQzJwR2x6OVZkeHZrYSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvdjEvbG9naW4iO3M6NToicm91dGUiO3M6Mzoic3BhIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770387879),
('rQrNV9gQ43oqebzvxc8kNAY09s1mjw3pwYlL8Eg3', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiek1RVWJwZExBVDN5aEU3UEw0cWlFaU5lZzZMcFpKcmZ3M0lPSGVENyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9kcml2ZXIvYm9va2luZ3MiO3M6NToicm91dGUiO3M6Mzoic3BhIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770392333),
('VRF8HnnPDICsOfyp6DIEmEAJdErR4WBRTqIXQZ6d', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieFFqSGh5RzFreExLbUJBQW5MYTFVR2szWjFGTkxvcjl2M0Z2dHJYZSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvdjEvbG9naW4iO3M6NToicm91dGUiO3M6Mzoic3BhIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770387792),
('WHZUfRLfYISpWK933SQVY2EWWgYtoGm7xeSokzNn', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicmZ0Sm5HS0I2UERES1JrN1JxNU9CNFVBYTQ0Y0piVDNhaTVTU2ZUYyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvdjEvbG9naW4iO3M6NToicm91dGUiO3M6Mzoic3BhIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770387880),
('xJb7l5Ip57PjnoWBZZGYzcNmrTBUnQzftMGDxUmE', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT05FU1kySWM2cng0Z2lWT3F4UjBiNnl4a04wVEtSNHQ1b3ZHOXVZMCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvdjEvbG9naW4iO3M6NToicm91dGUiO3M6Mzoic3BhIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770387758);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  `is_encrypted` tinyint(1) NOT NULL DEFAULT 0,
  `group` varchar(50) NOT NULL DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `is_encrypted`, `group`, `created_at`, `updated_at`) VALUES
(1, 'site_name', 'Ice Cream Truck', 0, 'general', '2026-01-30 14:32:35', '2026-01-30 14:32:35'),
(2, 'site_email', 'hello@icecreamtruck.com', 0, 'general', '2026-01-30 14:32:35', '2026-01-30 14:32:35'),
(3, 'site_phone', '1-800-ICE-CREAM', 0, 'general', '2026-01-30 14:32:35', '2026-01-30 14:32:35'),
(4, 'business_address', '123 Sweet Street, Dessert City', 0, 'general', '2026-01-30 14:32:35', '2026-01-30 14:32:35'),
(5, 'facebook_url', 'https://facebook.com/icecreamtruck', 0, 'social', '2026-01-30 14:32:35', '2026-01-30 14:32:35'),
(6, 'instagram_url', 'https://instagram.com/icecreamtruck', 0, 'social', '2026-01-30 14:32:36', '2026-01-30 14:32:36'),
(7, 'twitter_url', 'https://twitter.com/icecreamtruck', 0, 'social', '2026-01-30 14:32:36', '2026-01-30 14:32:36'),
(8, 'stripe_public_key', 'pk_test_dummy', 0, 'stripe', '2026-01-30 14:32:36', '2026-01-30 14:32:36'),
(9, 'stripe_webhook_secret', 'whsec_dummy', 1, 'stripe', '2026-01-30 14:32:36', '2026-01-30 14:32:36'),
(10, 'google_maps_api_key', '', 0, 'google', '2026-01-30 14:32:36', '2026-01-30 14:32:36'),
(11, 'openai_api_key', 'eyJpdiI6Im1Ic2NVWGNKTzVpVStsRms2bnVhQWc9PSIsInZhbHVlIjoiOGt2Z2FUOW8ySVZGdVVuNzJtaFFWRUlsL1BVN0M5SE5VQ0pXUFlSTFB1WndYOHJvRW1UK0k5TjFBMFRFMnZPTXhhK2Jjc1pzTC9rdjhGN3l0MjQwSk96STJKbHl4dklZUk93OHIrOVEzeVlRNkxESzRwTjRrb1FwdmgrSzR6UVVoZGJKNkdwczQzRkVYQjJZWGlyaFBsaUJNYVNEMzVCUXZnaXA1RVREbGRtMDU2c0h1VllLZ0J6cTFBMEVWOGZ0SzM1WGZHTzBBRWpYTE9RSERDSDlsMVp4bzJPOFBLRkd4Q1F4R2h4V3Qrbz0iLCJtYWMiOiJkNTI1NTEyOTFmNzQwYWNmMzM1YjViMWYyMDEzNzcwMmY2M2RhNzI2MzVhNmVmYTMzODVlYmNmNDAyNTM3NmM3IiwidGFnIjoiIn0=', 1, 'ai', '2026-01-30 14:32:36', '2026-01-30 15:44:59'),
(12, 'meta_title_default', 'Ice Cream Truck | Book Your Event', 0, 'seo', '2026-01-30 14:32:36', '2026-01-30 14:32:36'),
(13, 'meta_description_default', 'Book an ice cream truck for parties and events.', 0, 'seo', '2026-01-30 14:32:36', '2026-01-30 14:32:36'),
(14, 'default_meta_title', 'fsdf', 0, 'seo', '2026-01-30 15:44:08', '2026-01-30 15:44:08'),
(15, 'default_meta_description', 'sdfsdf', 0, 'seo', '2026-01-30 15:44:09', '2026-01-30 15:44:09'),
(16, 'default_meta_keywords', 'sdfsdf', 0, 'seo', '2026-01-30 15:44:09', '2026-01-30 15:44:09'),
(17, 'ai_model', 'gpt-3.5-turbo', 0, 'ai', '2026-01-30 15:44:59', '2026-01-30 15:44:59'),
(18, 'ai_max_tokens', '1000', 0, 'ai', '2026-01-30 15:44:59', '2026-01-30 15:44:59'),
(19, 'ai_temperature', '0.4', 0, 'ai', '2026-01-30 15:44:59', '2026-01-30 15:44:59'),
(20, 'ai_enabled', '1', 0, 'ai', '2026-01-30 15:44:59', '2026-01-30 15:44:59'),
(21, 'site_logo', '/storage/settings/YUpJGHNQdBfsMZOQx5AZUusBTpcofbAqjhQb2Rhx.png', 0, 'general', '2026-02-06 08:56:20', '2026-02-06 08:56:46'),
(22, 'header_logo', '/storage/settings/9BnnB3HLrodQnSuCZAgFkzzptR6YrtQ5LO27gKzR.png', 0, 'general', '2026-02-06 08:56:28', '2026-02-06 08:57:54'),
(23, 'footer_logo', '/storage/settings/bCuhUfKgntPYHvE5dGkbiOy8sXtjCsCIRxrC7Hds.png', 0, 'general', '2026-02-06 08:56:32', '2026-02-06 08:56:32'),
(24, 'site_favicon', '/storage/settings/WPbgDHrkV585QJWrNjab7MwOdz367YHavalMgTcK.png', 0, 'general', '2026-02-06 08:57:03', '2026-02-06 08:57:03');

-- --------------------------------------------------------

--
-- Table structure for table `trucks`
--

CREATE TABLE `trucks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `truck_number` varchar(50) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `capacity` int(10) UNSIGNED DEFAULT NULL,
  `plate_number` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trucks`
--

INSERT INTO `trucks` (`id`, `name`, `truck_number`, `model`, `capacity`, `plate_number`, `image`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Truck 1', 'FT-3221', 'Mini Truck', 25, 'ICT-001', 'trucks/0kR3IR9DOPLHDQ7PhKrfgIUd51m4rFvF2ZAkTjN7.jpg', NULL, 1, '2026-01-30 14:32:34', '2026-01-30 17:15:11'),
(2, 'Truck 2', 'FT-331', 'Large Van', 50, 'ICT-002', 'trucks/K2D5r1Tp7fnKMLwbmVQDeCpHTdZ0k3LhgyxL021L.jpg', 'Test', 1, '2026-01-30 14:32:35', '2026-01-30 17:14:30'),
(3, 'Truck 2', 'FT-1232', 'Standard Van', 20, NULL, 'trucks/dBr4mtQaZcXGkzV1IgkDgIiXzi6A7pUfIH3pgEou.jpg', 'Test', 1, '2026-01-30 17:13:46', '2026-01-30 17:14:18');

-- --------------------------------------------------------

--
-- Table structure for table `truck_inventory_snapshots`
--

CREATE TABLE `truck_inventory_snapshots` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `truck_id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `snapshot_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `review_status` varchar(20) NOT NULL DEFAULT 'pending_review',
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `truck_inventory_snapshots`
--

INSERT INTO `truck_inventory_snapshots` (`id`, `truck_id`, `booking_id`, `snapshot_at`, `review_status`, `reviewed_at`, `reviewed_by`, `created_at`, `updated_at`) VALUES
(1, 1, 3, '2026-01-30 14:32:37', 'pending_review', NULL, NULL, '2026-01-30 14:32:37', '2026-01-30 14:32:37'),
(2, 1, 4, '2026-01-30 15:51:48', 'pending_review', NULL, NULL, '2026-01-30 15:51:48', '2026-01-30 15:51:48'),
(3, 1, 13, '2026-02-06 09:55:29', 'pending_review', NULL, NULL, '2026-02-06 09:55:29', '2026-02-06 09:55:29'),
(4, 2, 11, '2026-02-06 15:58:45', 'approved', '2026-02-06 10:58:45', 1, '2026-02-06 10:50:39', '2026-02-06 10:58:45');

-- --------------------------------------------------------

--
-- Table structure for table `truck_inventory_snapshot_lines`
--

CREATE TABLE `truck_inventory_snapshot_lines` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `truck_inventory_snapshot_id` bigint(20) UNSIGNED NOT NULL,
  `inventory_product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity_assigned` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `quantity_used` int(10) UNSIGNED DEFAULT NULL,
  `quantity_remaining` int(10) UNSIGNED DEFAULT NULL,
  `quantity_waste` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `truck_inventory_snapshot_lines`
--

INSERT INTO `truck_inventory_snapshot_lines` (`id`, `truck_inventory_snapshot_id`, `inventory_product_id`, `quantity_assigned`, `quantity_used`, `quantity_remaining`, `quantity_waste`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 7, NULL, NULL, NULL, '2026-01-30 14:32:37', '2026-01-30 14:32:37'),
(2, 1, 2, 11, NULL, NULL, NULL, '2026-01-30 14:32:37', '2026-01-30 14:32:37'),
(3, 2, 1, 10, NULL, NULL, NULL, '2026-01-30 15:51:48', '2026-01-30 15:51:48'),
(4, 2, 2, 10, NULL, NULL, NULL, '2026-01-30 15:51:48', '2026-01-30 15:51:48'),
(5, 3, 2, 10, 10, 10, NULL, '2026-02-06 09:55:29', '2026-02-06 10:26:14'),
(6, 3, 3, 10, 8, 10, NULL, '2026-02-06 09:55:29', '2026-02-06 10:26:14'),
(7, 3, 1, 10, 5, 10, NULL, '2026-02-06 09:55:29', '2026-02-06 10:26:14'),
(8, 4, 2, 5, 4, 0, 1, '2026-02-06 10:50:39', '2026-02-06 10:58:45'),
(9, 4, 3, 5, 5, 0, 0, '2026-02-06 10:50:40', '2026-02-06 10:58:45'),
(10, 4, 1, 5, 2, 1, 2, '2026-02-06 10:50:40', '2026-02-06 10:58:45');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `license` varchar(100) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'customer',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `phone`, `license`, `avatar`, `email`, `role`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin', NULL, NULL, 'profiles/5SP3JULxdrRQJjfQPD8U5R6uOB8Wt5RoMi3nYfUK.png', 'admin@icecreamtruck.com', 'admin', NULL, '$2y$12$pH452QJDcLrgnQCoG9HqF.jkPMrDPB8NoPJYG2kSsqgg3EpnOtwOy', NULL, '2026-01-30 14:32:32', '2026-01-30 15:29:44'),
(2, 'Driver One', '555-0101', NULL, 'profiles/NSBlqh5JyhkCELhrFBsEHPPlFOMNNpuKqsR8oMch.jpg', 'driver@icecreamtruck.com', 'driver', NULL, '$2y$12$zYy0Di8ZnXqjSMRpcLzX0.iQry9pZDpsvG8hwJzvVbeLLg8Lu.uEK', NULL, '2026-01-30 14:32:32', '2026-02-06 09:52:26'),
(3, 'Driver Two', '555-0102', NULL, 'profiles/Bm92JHABx3F7sXhLPr0QXMJS2WmRWF2LHCzIaZic.png', 'driver2@icecreamtruck.com', 'driver', NULL, '$2y$12$7Y/xJZhdxp2ut8wfDkPRguZmFW2BAq2WRJGDfBhKiCf2Ec/9mtYSu', NULL, '2026-01-30 14:32:32', '2026-02-06 10:55:36'),
(4, 'Jane Customer', '555-1000', NULL, NULL, 'customer@example.com', 'customer', NULL, '$2y$12$Bn9yn/JZygxCgnc.ly8steENItKLJcbM87m5UEjpdVt2h7O/8OMZi', NULL, '2026-01-30 14:32:32', '2026-01-30 14:32:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_logs_user_id_foreign` (`user_id`),
  ADD KEY `activity_logs_subject_type_subject_id_index` (`subject_type`,`subject_id`),
  ADD KEY `activity_logs_created_at_index` (`created_at`);

--
-- Indexes for table `add_ons`
--
ALTER TABLE `add_ons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bookings_uuid_unique` (`uuid`),
  ADD KEY `bookings_package_id_foreign` (`package_id`),
  ADD KEY `bookings_truck_id_foreign` (`truck_id`),
  ADD KEY `bookings_driver_id_foreign` (`driver_id`);

--
-- Indexes for table `booking_add_ons`
--
ALTER TABLE `booking_add_ons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_add_ons_booking_id_foreign` (`booking_id`),
  ADD KEY `booking_add_ons_add_on_id_foreign` (`add_on_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `cms_pages`
--
ALTER TABLE `cms_pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cms_pages_slug_unique` (`slug`);

--
-- Indexes for table `driver_locations`
--
ALTER TABLE `driver_locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `driver_locations_booking_id_foreign` (`booking_id`),
  ADD KEY `driver_locations_user_id_recorded_at_index` (`user_id`,`recorded_at`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inventory_products`
--
ALTER TABLE `inventory_products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `service_areas`
--
ALTER TABLE `service_areas`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_unique` (`key`);

--
-- Indexes for table `trucks`
--
ALTER TABLE `trucks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `truck_inventory_snapshots`
--
ALTER TABLE `truck_inventory_snapshots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `truck_inventory_snapshots_truck_id_foreign` (`truck_id`),
  ADD KEY `truck_inventory_snapshots_booking_id_foreign` (`booking_id`),
  ADD KEY `truck_inventory_snapshots_reviewed_by_foreign` (`reviewed_by`);

--
-- Indexes for table `truck_inventory_snapshot_lines`
--
ALTER TABLE `truck_inventory_snapshot_lines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `truck_inv_snap_line_snap_id_foreign` (`truck_inventory_snapshot_id`),
  ADD KEY `truck_inventory_snapshot_lines_inventory_product_id_foreign` (`inventory_product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `add_ons`
--
ALTER TABLE `add_ons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `booking_add_ons`
--
ALTER TABLE `booking_add_ons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `cms_pages`
--
ALTER TABLE `cms_pages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `driver_locations`
--
ALTER TABLE `driver_locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `inventory_products`
--
ALTER TABLE `inventory_products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `service_areas`
--
ALTER TABLE `service_areas`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `trucks`
--
ALTER TABLE `trucks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `truck_inventory_snapshots`
--
ALTER TABLE `truck_inventory_snapshots`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `truck_inventory_snapshot_lines`
--
ALTER TABLE `truck_inventory_snapshot_lines`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bookings_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_truck_id_foreign` FOREIGN KEY (`truck_id`) REFERENCES `trucks` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `booking_add_ons`
--
ALTER TABLE `booking_add_ons`
  ADD CONSTRAINT `booking_add_ons_add_on_id_foreign` FOREIGN KEY (`add_on_id`) REFERENCES `add_ons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_add_ons_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `driver_locations`
--
ALTER TABLE `driver_locations`
  ADD CONSTRAINT `driver_locations_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `driver_locations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `truck_inventory_snapshots`
--
ALTER TABLE `truck_inventory_snapshots`
  ADD CONSTRAINT `truck_inventory_snapshots_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `truck_inventory_snapshots_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `truck_inventory_snapshots_truck_id_foreign` FOREIGN KEY (`truck_id`) REFERENCES `trucks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `truck_inventory_snapshot_lines`
--
ALTER TABLE `truck_inventory_snapshot_lines`
  ADD CONSTRAINT `truck_inv_snap_line_snap_id_foreign` FOREIGN KEY (`truck_inventory_snapshot_id`) REFERENCES `truck_inventory_snapshots` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `truck_inventory_snapshot_lines_inventory_product_id_foreign` FOREIGN KEY (`inventory_product_id`) REFERENCES `inventory_products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
