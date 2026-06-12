import type { Metadata } from "next";
import InstantBrowser from "@/components/InstantBrowser";

export const metadata: Metadata = {
  title: "Instant Service — Book a helper by the day | GharSeva",
  description: "Need a cook, maid or helper for a day or two? Browse helpers available for daily booking, pick your dates, and book instantly.",
};

export default function InstantPage() {
  return <InstantBrowser />;
}
