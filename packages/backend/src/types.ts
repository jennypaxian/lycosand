export const notificationTypes = [
	"follow",
	"mention",
	"reply",
	"renote",
	"quote",
	"reaction",
	"pollVote",
	"pollEnded",
	"receiveFollowRequest",
	"followRequestAccepted",
	"groupInvited",
	"app",
] as const;

export const noteVisibilities = [
	"public",
	"home",
	"followers",
	"specified",
	"hidden",
] as const;

export const ffVisibility = ["public", "followers", "private"] as const;
