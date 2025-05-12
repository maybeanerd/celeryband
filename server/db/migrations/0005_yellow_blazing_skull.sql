PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_salary` (
	`ownerId` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`seniorityLevel` text NOT NULL,
	`department` text NOT NULL,
	`yearlyAmount` integer NOT NULL,
	`hoursPerWeek` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_salary`("ownerId", "role", "seniorityLevel", "department", "yearlyAmount", "hoursPerWeek", "createdAt", "updatedAt") SELECT "ownerId", "role", "seniorityLevel", "department", "yearlyAmount", "hoursPerWeek", "createdAt", "updatedAt" FROM `salary`;--> statement-breakpoint
DROP TABLE `salary`;--> statement-breakpoint
ALTER TABLE `__new_salary` RENAME TO `salary`;--> statement-breakpoint
PRAGMA foreign_keys=ON;