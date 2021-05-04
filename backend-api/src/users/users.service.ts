/**
 * Data Model Interfaces
 */

import { BaseUser, User } from "./user.interface";
import { Users } from "./users.interface";

/**
 * In-Memory Store
 */

let users: users = {
	1: {
		id: 1,
		userId: "admin",
		userPw: "admin",
		lastLogin: "2021/04/27",
		companyNum: "00000000",
		companyName: "Chloe",
		companyEmail: "kks.chloe@gmail.com"
	}
};

/**
 * Service Methods
 */

export const find = async (id: number): Promise<User> => users[id];

export const create = async (newUser: BaseUser): Promise<User> => {
	const id = new Date().valueOf();

	users[id] = {
		id,
		...newUser,
	};

	return users[id];
};

export const update = async (
	id: number,
	userUpdate: BaseUser
): Promise<User | null> => {
	const user = await find(id);

	if (!user) {
		return null;
	}

	users[id] = { id, ...userUpdate };
	return users[id];
};

export const remove = async (id: number): Promise<null | void> => {
	const user = await find(id);

	if (!user) {
		return null;
	}

	delete users[id];

};


