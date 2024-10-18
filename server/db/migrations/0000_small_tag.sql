CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`emailHash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_emailHash_unique` ON `user` (`emailHash`);