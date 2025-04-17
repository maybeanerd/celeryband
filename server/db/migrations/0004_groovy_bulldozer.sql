CREATE TABLE `salary` (
	`ownerId` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`seniorityLevel` text NOT NULL,
	`department` text NOT NULL,
	`yearlyAmount` integer NOT NULL,
	`hoursPerWeek` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
