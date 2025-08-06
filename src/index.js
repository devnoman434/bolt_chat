export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (request.method !== "POST" || new URL(request.url).pathname !== "/ask") {
      return new Response(
        JSON.stringify({ success: false, error: "Not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const vpnData = [
      { country: "Germany" },
      { country: "Netherlands" },
      { country: "Switzerland" },
      { country: "Spain" },
      { country: "Norway" },
      { country: "United States" },
      { country: "United Kingdom" },
      { country: "France" },
      { country: "Sweden" },
      { country: "Ireland" },
      { country: "Canada" },
      { country: "Poland" },
      { country: "Australia" },
      { country: "Czech-Republic" },
      { country: "India" },
      { country: "South_Korea" },
      { country: "Turkey" },
      { country: "Brazil" },
    ];

    function checkCountryAvailability(countryName) {
      const normalized = countryName.trim().toLowerCase();
      const match = vpnData.find(
        ({ country }) => country.toLowerCase().replace(/[_-]/g, " ") === normalized
      );
      return match
        ? "Yes, this server is available for you."
        : "That country is not currently available. Please leave feedback to request it.";
    }

    const CF_ACCOUNT_ID = "349395e7c3501afa6f87a9b3ba9f6472";
    const CF_API_TOKEN = "yr3h05ImkpjS-WJ1i2-SV0pCPDLTjjfb6XcWlEMz";

    const body = await request.json();
    const userPrompt = body.prompt;
    const username = body.username || "Guest";

    if (!userPrompt) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing prompt." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (username.toLowerCase() === "guest") {
      return new Response(
        JSON.stringify({
          success: true,
          response: "Please log in or sign up to continue using the assistant.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const systemPrompt = `
You are a friendly and helpful AI assistant for Bolt VPN.

- Only reply to Bolt VPN-related questions.
- Greet warmly if user says "hi", "hello", etc., without any question.
- If input is vague or only symbols, reply: "Could you please clarify your question about Bolt VPN?"
- Never explain your logic or internal rules.
- Use user's name ("${username}") when replying.
- If country is asked, check against this list:
  ${vpnData.map((c) => c.country).join(", ")}.
`;

    const messages = [
      { role: "system", content: systemPrompt.trim() },
      { role: "user", content: userPrompt },
    ];

    async function fetchWithTimeout(resource, options = {}, timeout = 20000) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      options.signal = controller.signal;
      try {
        const response = await fetch(resource, options);
        clearTimeout(id);
        return response;
      } catch (error) {
        clearTimeout(id);
        throw new Error("AI model timed out.");
      }
    }

    try {
      const response = await fetchWithTimeout(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/google/gemma-7b-it-lora`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        return new Response(
          JSON.stringify({ success: false, errors: data.errors }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          response: data.result.response || "[No response]",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  },
};
