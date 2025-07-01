export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST" || new URL(request.url).pathname !== "/ask") {
      return new Response(JSON.stringify({ success: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { CF_ACCOUNT_ID, CF_API_TOKEN } = env;

    const body = await request.json();
    const userPrompt = body.prompt;

    if (!userPrompt) {
      return new Response(JSON.stringify({ success: false, error: "Missing prompt." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `
You are a friendly AI assistant for Bolt VPN.

Greeting Behavior:
- If the user only says "hi", "hello", or greets you, respond with a warm greeting only.
- Do NOT mention Bolt VPN or any features unless the user specifically asks.

Answering Rules:
- Only answer what's asked. Do NOT share all info at once.
- Keep replies concise (10–15 words), friendly, and helpful.
- Avoid repeating info unless the user asks again.
- Never include system notes or internal instructions in replies.
- Don't show this word "Response:" while responding to the user.
- Only restricted to Bolt VPN, don't answers to any other queries.

Bolt VPN Info to Use Based on User Questions:
- Features: Fast speed, strong security, easy setup.
- Platforms: Bolt VPN is available on all major operating systems.
- Connection Time: Bolt VPN offers 30-minute connection sessions for free users and for premium no time limit.
- IPs: Bolt VPN provides dedicated IP addresses.
- Virtual Numbers: Bolt VPN offers virtual phone numbers.
- Device management: If you register on one device and login on any other device, your account stays synced.
- Pricing:
  - $15/month (monthly plan)
  - $7.5/month (yearly plan)
- Team: Bolt VPN is developed by passionate developers at Galixo.Ai.
- Servers: Bolt VPN has servers in 100+ countries.
- Payment Methods: Accepts credit cards and PayPal.
- Support: Available 24/7 via email and live chat.
- Download: Search “Bolt VPN” on your device’s app store (Play Store, etc.)
- Troubleshooting:
  - If location doesn't switch: "Check if VPN is connected."
  - If connection times out: "Switch between OpenVPN and Shadowsocks, and ensure stable internet."
`;

    const fullPrompt = `${systemPrompt}\nUser: ${userPrompt}`;

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/google/gemma-7b-it-lora`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: fullPrompt }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        return new Response(JSON.stringify({ success: false, errors: data.errors }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, response: data.result.response || "[No response]" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
