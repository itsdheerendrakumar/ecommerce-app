"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { Props as ReactApexChartProps } from "react-apexcharts";
import { Skeleton } from "@/components/ui/skeleton";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full min-h-[260px] rounded-xl" />,
});

export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      const root = document.documentElement;
      const hasDarkClass = root.classList.contains("dark");
      const prefersDark =
        !root.classList.contains("light") &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      setIsDark(hasDarkClass || prefersDark);
    };

    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    mediaQuery?.addEventListener?.("change", checkDark);

    return () => {
      observer.disconnect();
      mediaQuery?.removeEventListener?.("change", checkDark);
    };
  }, []);

  return isDark;
}

interface AdminApexChartProps {
  type: NonNullable<ReactApexChartProps["type"]>;
  series: NonNullable<ApexOptions["series"]>;
  options: ApexOptions;
  height?: number | string;
  width?: number | string;
}

export function AdminApexChart({
  type,
  series,
  options,
  height = 300,
  width = "100%",
}: AdminApexChartProps) {
  const isDark = useIsDarkMode();

  const mergedOptions: ApexOptions = useMemo(() => {
    const labelColor = isDark ? "#a1a1aa" : "#71717a";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

    return {
      ...options,
      chart: {
        fontFamily: "var(--font-sans), Poppins, sans-serif",
        background: "transparent",
        foreColor: labelColor,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          speed: 450,
        },
        ...options.chart,
      },
      theme: {
        mode: isDark ? "dark" : "light",
        ...options.theme,
      },
      grid: {
        borderColor: gridColor,
        strokeDashArray: 4,
        ...options.grid,
      },
      tooltip: {
        theme: isDark ? "dark" : "light",
        style: {
          fontFamily: "var(--font-sans), Poppins, sans-serif",
          fontSize: "12px",
        },
        ...options.tooltip,
      },
      legend: {
        fontFamily: "var(--font-sans), Poppins, sans-serif",
        fontSize: "12px",
        fontWeight: 600,
        labels: {
          colors: labelColor,
        },
        ...options.legend,
      },
    };
  }, [isDark, options]);

  return (
    <ReactApexChart
      type={type}
      series={series}
      options={mergedOptions}
      height={height}
      width={width}
    />
  );
}
