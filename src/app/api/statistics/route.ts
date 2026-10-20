import { DailyStatsModel, GlobalStatsModel } from "@/database/models/visitor-model";
import dbConnect from "@/database/services/mongo";
import { checkIsAdmin } from "@/lib/auth-utils";
import { NextResponse } from "next/server";

interface GlobalStatsDoc {
    totalPageViews?: number;
    totalUniqueVisitors?: number;
    devices?: Map<string, number> | Record<string, number>;
    countries?: Map<string, number> | Record<string, number>;
    pages?: Map<string, number> | Record<string, number>;
    referrals?: Map<string, number> | Record<string, number>;
}

const TOP_LIMIT = 10;

function mapToSortedArray<T extends string>(
    data: Map<string, number> | Record<string, number> | undefined,
    keyName: T
): Array<{ [K in T]: string } & { count: number }> {
    if (!data) return [];
    const obj = data instanceof Map ? Object.fromEntries(data) : data;
    return Object.entries(obj)
        .map(([key, count]) => ({ [keyName]: key.replaceAll("_", "."), count } as { [K in T]: string } & { count: number }))
        .sort((a, b) => b.count - a.count);
}

/** Visitor analytics for the admin dashboard. Admin-only. */
export async function GET() {
    try {
        if (!(await checkIsAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const startDate = thirtyDaysAgo.toISOString().split("T")[0];

        const [globalStats, dailyStats] = await Promise.all([
            GlobalStatsModel.findOne({ key: "global" }).lean() as Promise<GlobalStatsDoc | null>,
            DailyStatsModel.find(
                { date: { $gte: startDate } },
                { date: 1, pageViews: 1, uniqueVisitors: 1 }
            ).sort({ date: 1 }).lean(),
        ]);

        const statsMap = new Map(
            dailyStats.map((s) => {
                const stat = s as unknown as { date: string; pageViews?: number; uniqueVisitors?: number };
                return [stat.date, { visitors: stat.pageViews || 0, uniqueVisitors: stat.uniqueVisitors || 0 }];
            })
        );

        // Fill gaps so the trend chart always has one point per day.
        const visitorTrends = [];
        const currentDate = new Date(thirtyDaysAgo);
        const today = new Date();

        while (currentDate <= today) {
            const dateStr = currentDate.toISOString().split("T")[0];
            const existing = statsMap.get(dateStr);
            visitorTrends.push({
                date: dateStr,
                visitors: existing?.visitors || 0,
                uniqueVisitors: existing?.uniqueVisitors || 0,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return NextResponse.json({
            totalVisitors: globalStats?.totalPageViews || 0,
            uniqueVisitors: globalStats?.totalUniqueVisitors || 0,
            visitorTrends,
            deviceStats: mapToSortedArray(globalStats?.devices, "device"),
            countryStats: mapToSortedArray(globalStats?.countries, "country"),
            pathStats: mapToSortedArray(globalStats?.pages, "path").slice(0, TOP_LIMIT),
            refStats: mapToSortedArray(globalStats?.referrals, "ref").slice(0, TOP_LIMIT),
        });
    } catch (error) {
        console.error("Error fetching statistics:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
