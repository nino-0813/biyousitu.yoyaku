CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orderHistory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`productId` integer NOT NULL,
	`orderDate` integer NOT NULL,
	`quantity` integer NOT NULL,
	`totalPrice` integer NOT NULL,
	`supplier` text,
	`notes` text,
	`userId` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`categoryId` integer NOT NULL,
	`currentStock` integer DEFAULT 0 NOT NULL,
	`minStock` integer DEFAULT 0 NOT NULL,
	`unit` text DEFAULT '個' NOT NULL,
	`pricePerUnit` integer DEFAULT 0 NOT NULL,
	`supplier` text,
	`notes` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `usageHistory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`productId` integer NOT NULL,
	`usageDate` integer NOT NULL,
	`quantity` integer NOT NULL,
	`notes` text,
	`userId` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`email` text,
	`role` text DEFAULT 'owner' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`lastSignedIn` integer NOT NULL
);
