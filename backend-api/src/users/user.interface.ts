export interface BaseUser {
	userId: string;
	userPw: string;
	lastLogin: string;
	companyNum: number;
	companyName: string;
	companyEmail: string;
}

export interface User extends BaseUser {
	id: number;
}
