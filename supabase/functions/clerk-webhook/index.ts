import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyWebhook } from "npm:@clerk/backend/webhooks";

const secretKeys = JSON.parse(
  Deno.env.get("SUPABASE_SECRET_KEYS")!
);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  secretKeys.default,
);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
    });
  }

  try {
    const webhookSecret = Deno.env.get("CLERK_WEBHOOK_SECRET");

    if (!webhookSecret) {
      return new Response("Missing webhook secret", {
        status: 500,
      });
    }

    const event = await verifyWebhook(req, {
      signingSecret: webhookSecret,
    });

    if (event.type !== "user.created") {
      return new Response("Ignored", {
        status: 200,
      });
    }

    const user = event.data;

    const primaryEmail =
      user.email_addresses?.find(
        (email) => email.id === user.primary_email_address_id,
      )?.email_address ?? null;

    const fullName =
      [user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ") || null;

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          clerk_user_id: user.id,
          full_name: fullName,
          email: primaryEmail,
          avatar_url: user.image_url ?? null,
        },
        {
          onConflict: "clerk_user_id",
        },
      );

    if (error) {
      console.error("Supabase error:", error);

      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Webhook error:", error);

    return new Response(
      JSON.stringify({
        error: "Webhook verification or processing failed",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
});