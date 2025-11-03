CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`orderDate` timestamp NOT NULL,
	`quantity` int NOT NULL,
	`totalPrice` int NOT NULL,
	`supplier` varchar(200),
	`notes` text,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`categoryId` int NOT NULL,
	`currentStock` int NOT NULL DEFAULT 0,
	`minStock` int NOT NULL DEFAULT 0,
	`unit` varchar(50) NOT NULL DEFAULT '個',
	`pricePerUnit` int NOT NULL DEFAULT 0,
	`supplier` varchar(200),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usageHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`usageDate` timestamp NOT NULL,
	`quantity` int NOT NULL,
	`notes` text,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usageHistory_id` PRIMARY KEY(`id`)
);
