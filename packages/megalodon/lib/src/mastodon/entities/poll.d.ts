/// <reference path="poll_option.d.ts" />
declare namespace MastodonEntity {
    type Poll = {
        id: string;
        expires_at: string | null;
        expired: boolean;
        multiple: boolean;
        votes_count: number;
        options: Array<PollOption>;
        voted: boolean;
    };
}
