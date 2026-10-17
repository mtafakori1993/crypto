"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/misc";

export const PriceChartLazy = dynamic(() => import("./price-chart"), { ssr: false, loading: () => <Skeleton className="h-full min-h-[420px] w-full" /> });
