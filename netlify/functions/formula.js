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

  const { tableData, query, format } = body;

  if (!tableData || !query || !format) {
    return new Response("Missing required fields", { status: 400 });
  }

  const isMultiSheet = tableData.includes("[") && tableData.match(/^\[.+\]/m);
  const app = format === "excel" ? "Microsoft Excel" : "Google Sheets";
  const sheetRefSyntax = format === "excel"
    ? "SheetName!A:B (e.g. Sheet2!A:B)"
    : "SheetName!A:B or 'Sheet Name'!A:B if the name has spaces";

  const systemPrompt = `You are a spreadsheet formula expert. The user will give you a table structure and ask a question.
Your job is to return the exact formula they need for ${app}.

Rules:
- Return ONLY the formula and a short explanation (2-3 sentences max)
- Use ${app} syntax specifically
- Assume data starts at row 2 (row 1 = headers) unless context suggests otherwise
- Format your response as:
  Formula: <the formula>
  Explanation: <brief explanation>
${isMultiSheet ? `
Multi-sheet context:
- The table data contains multiple sheets, each labeled like [Sheet1], [Sheet2], etc.
- When the formula needs to reference another sheet, use the correct cross-sheet syntax: ${sheetRefSyntax}
- Match sheet names exactly as provided in the labels
` : ""}`;

  const userMessage = `Table structure:
${tableData}

Question: ${query}`;

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 512,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return new Response(`DeepSeek API error: ${err}`, { status: 502 });
  }

  const data = await response.json();
  const result = data.choices?.[0]?.message?.content ?? "No response from model.";

  return new Response(JSON.stringify({ result }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const config = {
  path: "/api/formula",
};
