import { NextResponse } from "next/server";
import { getSubscribersAction } from "../../../actions/subscription-actions";

/**
 * GET /api/subscribers - Fetch subscribers (supports filtering via ?search=)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    
    const subscribers = await getSubscribersAction(search);
    return NextResponse.json(subscribers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}
