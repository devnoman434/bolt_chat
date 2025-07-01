export default {
  async fetch(request,env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Ensure POST method
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: "Only POST allowed" }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    try {
      const body = await request.json();
      const userPrompt = body.prompt;

      if (!userPrompt) {
        return new Response(JSON.stringify({ success: false, error: "Missing prompt." }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
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
- Device management : If you register on one device and login on any other device,any other OS so your account remains same because of syncing of your account and in premium plan this is very useful.
- Pricing:
  - $15/month (monthly plan)
  - $7.5/month (yearly plan)
- Team: Bolt VPN is developed by passionate developers at Galixo.Ai.
- Servers: Bolt VPN has servers in 100+ countries.
- Payment Methods: Accepts credit cards and PayPal.
- Support: Available 24/7 via email and live chat.
- Download: If you have to download Bolt VPN then go to specific OS store and serach for it,we have service for every OS.Like for android it is playstore and like that.
- If a user asks for connection timeout then tell the respected user to use the stable internet connection or switch to some other protocol,there are two protocols in our case...switch if you are using OpenVPN to shadowsocks or if you are using Shadowsocks then switch to openvpn. (Don't write this at once)
- If a user asks that location is not switching,then tell him/her "Check if vpn is connected or not".
- If a user does not including the name of Bolt VPN then you have to unterstand that user is always asking about Bolt VPN not anything else.
`;

      const fullPrompt = `${systemPrompt}\nUser: ${userPrompt}`;
      const ACCOUNT_ID = env.CF_ACCOUNT_ID;
      const API_TOKEN = env.CF_API_TOKEN;
      const MODEL_NAME = "@cf/google/gemma-7b-it-lora";

      const aiRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL_NAME}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: fullPrompt }),
        }
      );

      const data = await aiRes.json();

      if (!data.success) {
        return new Response(JSON.stringify({
          success: false,
          errors: data.errors || ["Unknown error"]
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        response: data.result.response || "[No response]",
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });

    } catch (err) {
      return new Response(JSON.stringify({ success: false, errors: [err.message] }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }
};
