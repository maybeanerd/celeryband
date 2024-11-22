CREATE TABLE `loginToken` (
	`token` text PRIMARY KEY NOT NULL,
	`emailHash` text NOT NULL,
	`expirationDate` integer NOT NULL
);
