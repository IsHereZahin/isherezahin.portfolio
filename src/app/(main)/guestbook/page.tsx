// src/app/(main)/guestbook/page.tsx
import GuestbookIndex from "@/components/pages/GuestbookIndex";
import { MY_FULL_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `GuestBook | ${MY_FULL_NAME}`,
    description: "Leave your thoughts, messages, or feedback on the Guestbook page.",
};

export default function GuestbookPage() {
    // The original guestbook discussion (#4) was removed; the guestbook now lives in #24.
    return <GuestbookIndex discussionNumber={24} />;
}