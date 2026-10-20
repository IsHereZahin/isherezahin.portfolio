"use client";

import { isLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/DictionaryProvider";
import Link from "next/link";
import type { ComponentProps } from "react";

type LocaleLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * next/link that keeps the visitor's language on in-site paths, so a link to
 * "/about" on a French page goes to "/fr/about". Anchors, external URLs and
 * paths that already carry a locale are passed through unchanged.
 */
export default function LocaleLink({ href, ...props }: LocaleLinkProps) {
    const { path } = useI18n();

    const isSitePath = href.startsWith("/") && !href.startsWith("//");
    const hasLocale = isLocale(href.split(/[/?#]/)[1]);

    return <Link href={isSitePath && !hasLocale ? path(href) : href} {...props} />;
}
