"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { BadgeCheckIcon, BriefcaseBusinessIcon, ClockIcon, UserIcon, FileIcon, MessageSquareIcon } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { activitiesApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

interface Activity {
  id: number;
  type: string;
  message: string;
  entityType?: string;
  entityId?: number;
  company?: {
    id: number;
    name: string;
  };
  createdAt: string;
}

function getActivityIcon(type: string) {
  const typeLower = type.toLowerCase();
  if (typeLower.includes("created") || typeLower.includes("uploaded")) {
    return BriefcaseBusinessIcon;
  }
  if (typeLower.includes("assigned") || typeLower.includes("user")) {
    return UserIcon;
  }
  if (typeLower.includes("commented") || typeLower.includes("message")) {
    return MessageSquareIcon;
  }
  if (typeLower.includes("updated") || typeLower.includes("status")) {
    return BadgeCheckIcon;
  }
  if (typeLower.includes("file") || typeLower.includes("document")) {
    return FileIcon;
  }
  return BriefcaseBusinessIcon;
}

export function LatestActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const user = getCurrentUser();
        if (!user?.id) {
          setLoading(false);
          return;
        }

        const data = await activitiesApi.getActivities({ userId: user.id });
        setActivities(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (error) {
        console.error("Failed to fetch latest activity:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Activity</CardTitle>
        <CardAction>
          <Link
            href="/pages/profile?tab=activities"
            className="text-muted-foreground hover:text-primary text-sm hover:underline">
            View All
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="ps-8">
        {loading ? (
          <div className="text-muted-foreground py-4 text-center text-sm">Loading activity...</div>
        ) : activities.length === 0 ? (
          <div className="text-muted-foreground py-4 text-center text-sm">No recent activity</div>
        ) : (
          <ol className="relative border-s">
            {activities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type);
              const isLast = index === activities.length - 1;

              return (
                <li key={activity.id} className={`ms-6 ${isLast ? "" : "mb-10"} space-y-2`}>
                  <span className="bg-muted absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full border">
                    <IconComponent className="text-primary size-3" />
                  </span>
                  <h3 className="flex items-center gap-2 font-semibold">
                    <span className="line-clamp-2">{activity.message}</span>
                    {index === 0 && <Badge variant="outline">Latest</Badge>}
                  </h3>
                  <time className="text-muted-foreground flex items-center gap-1.5 text-sm leading-none">
                    <ClockIcon className="size-3" />
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </time>
                  {activity.company && (
                    <p className="text-muted-foreground text-sm">{activity.company.name}</p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
