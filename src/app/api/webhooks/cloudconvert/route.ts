import { type NextRequest, NextResponse } from "next/server";
import { cloudConvert } from "@/lib/cloudconvert/client";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("CloudConvert-Signature");
    const payload = await request.text();

    if (!signature || !process.env.CLOUDCONVERT_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify webhook signature
    const isValid = cloudConvert.webhooks.verify(
      payload,
      signature,
      process.env.CLOUDCONVERT_WEBHOOK_SECRET,
    );

    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse webhook event
    const event = JSON.parse(payload);

    // Handle different event types
    if (event.event === "job.finished") {
      console.log(`Job ${event.job.id} finished successfully`);
      // Here you could update a database or cache
    } else if (event.event === "job.failed") {
      console.error(`Job ${event.job.id} failed:`, event.job.error);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
