import { NextResponse } from "next/server";

// Looks up an Indian pincode via the free India Post API and returns the
// city (district) + the list of area/post-office names.
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[0-9]{6}$/.test(code)) return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${code}`, {
      // cache pincode results for a day
      next: { revalidate: 86400 },
    });
    const data = await res.json();
    const entry = Array.isArray(data) ? data[0] : null;
    if (!entry || entry.Status !== "Success" || !entry.PostOffice?.length) {
      return NextResponse.json({ found: false });
    }
    const offices = entry.PostOffice as { Name: string; District: string; State: string }[];
    const city = offices[0].District;
    const state = offices[0].State;
    const areas = Array.from(new Set(offices.map((o) => o.Name)));
    return NextResponse.json({ found: true, city, state, areas });
  } catch {
    return NextResponse.json({ found: false });
  }
}
