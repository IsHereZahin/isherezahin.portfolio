"use client";

import LocaleLink from "./LocaleLink";

interface ClickableTagProps {
    tag: string;
    type: "blog" | "project";
    className?: string;
}

export default function ClickableTag({ tag, type, className }: Readonly<ClickableTagProps>) {
    const href = type === "blog" ? `/blogs?tags=${encodeURIComponent(tag)}` : `/projects?tags=${encodeURIComponent(tag)}`;

    return (
        <LocaleLink
            href={href}
            className={`text-sm lowercase px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors duration-200 cursor-pointer ${className ?? ""}`}
        >
            {tag}
        </LocaleLink>
    );
}
