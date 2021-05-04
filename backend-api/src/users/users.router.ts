/**
 * Required External Modules and Interfaces
 */

import express, { Request, Response } from "express";
import * as UserService from "./users.service";
import { BaseUser, User } from "./users.interface";

/**
 * Router Definition
 */

export const usersRouter = express.Router();


/**
 * Controller Definitions
 */

// GET users/:id

usersRouter.get("/:id", async (req: Request, res: Response) => {
	const id: number = parseInt(req.params.id, 10);

	try {
		const user: User = await UserService.find(id);

		if (user) {
			res.status(200).send(user);
		}

		res.status(404).send("user not found");
	} catch (e) {
		res.status(500).send(e.message);
	}
});

// POST users

usersRouter.post("/", async (req: Request, res: Response) => {
	try {
		const user: BaseUser = req.body;
		const newUser = await UserService.create(user);

		res.status(201).json(newUser);
	} catch(e) {
		res.status(500).send(e.message);
	}
});

// PUT users/:id

usersRouter.put("/:id", async (req: Request, res: Response) => {
	const id: number = parseInt(req.params.id, 10);

	try {
		const userUpdate: User = req.body;
		const existingUser: User = await UserService.find(id);

		if(existingUser) {
			const updatedUser = await UserService.update(id, userUpdate);
			return res.status(200).json(updatedUser);
		}

		res.status(404).send("user not found");
	} catch (e) {
		res.status(500).send(e.message);
	}
});

// DELETE users/:id

usersRouter.delete("/:id", async (req: Request, res: Response) => {
	try {
		const id: number = parseInt(req.params.id, 10);
		await UserService.remove(id);

		res.sendStatus(204);
	} catch (e) {
		res.status(500).send(e.message);
	}
});

