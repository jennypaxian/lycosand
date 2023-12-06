export type UserResponse = {
	id: string;
	username: string;
	avatarUrl?: string;
	bannerUrl?: string;
}

export type UserDetailedResponse = UserResponse & {
	followers: number;
	following: number;
}
