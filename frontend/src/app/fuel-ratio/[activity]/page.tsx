import { notFound } from "next/navigation";
import { ActivityPage } from "@/components/activity-page";
import { ActivityKey } from "@/lib/frms-types";

const activities: ActivityKey[] = ["loading", "hauling", "supporting", "dewatering"];

export default async function FuelRatioActivity({ params }: { params: Promise<{ activity: string }> }) {
  const { activity } = await params;
  if (!activities.includes(activity as ActivityKey)) notFound();
  return <ActivityPage activity={activity as ActivityKey} />;
}
