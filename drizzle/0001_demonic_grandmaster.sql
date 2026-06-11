CREATE TABLE `affirmations` (
	`id` varchar(64) NOT NULL,
	`text` text NOT NULL,
	`language` varchar(10) NOT NULL DEFAULT 'en',
	`category` varchar(50) NOT NULL DEFAULT 'general',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affirmations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `breathingExercises` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`language` varchar(10) NOT NULL DEFAULT 'en',
	`durationSeconds` int NOT NULL,
	`instructions` text,
	`pattern` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `breathingExercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crisisAlerts` (
	`id` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int,
	`messageId` varchar(64) NOT NULL,
	`crisisType` enum('self_harm','suicide','harm_to_others') NOT NULL,
	`confidenceScore` decimal(3,2),
	`resourcesShown` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crisisAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moodLogs` (
	`id` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int,
	`preMood` int,
	`postMood` int,
	`preNote` text,
	`postNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `moodLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessionExports` (
	`id` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int,
	`format` enum('pdf','text') NOT NULL,
	`fileKey` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessionExports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessionSummaries` (
	`id` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`keyTopics` text,
	`emotionalInsights` text,
	`suggestedNextSteps` text,
	`fullSummary` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessionSummaries_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessionSummaries_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(64) NOT NULL,
	`userId` int,
	`title` varchar(255),
	`status` enum('active','ended','archived') NOT NULL DEFAULT 'active',
	`language` varchar(10) NOT NULL DEFAULT 'en',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`endedAt` timestamp,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` varchar(10) DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `preferredTheme` enum('light','dark') DEFAULT 'light' NOT NULL;