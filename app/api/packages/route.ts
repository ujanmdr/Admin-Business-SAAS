import { NextResponse } from "next/server";
import { getPackagesAction, createPackageAction, CreatePackageSchema } from "../../../actions/subscription-actions";

/**
 * GET /api/packages - Fetch all packages
 */
export async function GET() {
  try {
    const packages = await getPackagesAction();
    return NextResponse.json(packages, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

/**
 * POST /api/packages - Create a new package
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Parse inputs using standard schema
    const result = CreatePackageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const actionResult = await createPackageAction(result.data);
    if (!actionResult.success) {
      return NextResponse.json({ error: actionResult.error }, { status: 400 });
    }

    return NextResponse.json(actionResult.data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
