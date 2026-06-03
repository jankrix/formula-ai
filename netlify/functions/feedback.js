const SHEET_URL = "https://script.google.com/macros/s/AKfycbzOojFW7wT9DvUQ_wEpI20G2oBmSeJv_UDci5_C97uMLAfod4bqJ8fi8LupsURRwf0T/exec";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  await fetch(SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const config = {
  path: "/api/feedback",
};
