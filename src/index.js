export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight request
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
  {
    country: "Germany",
    flag: "/assets/countries/Germany.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "Netherlands",
    flag: "/assets/countries/Netherlands.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "Switzerland",
    flag: "/assets/countries/Switzerland.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "Spain",
    flag: "/assets/countries/Spain.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "Norway",
    flag: "/assets/countries/Norway.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "United States",
    flag: "/assets/countries/United_States.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "United Kingdom",
    flag: "/assets/countries/Great_Britain.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "France",
    flag: "/assets/countries/France.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "Sweden",
    flag: "/assets/countries/Sweden.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "Ireland",
    flag: "/assets/countries/Ireland.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "Canada",
    flag: "/assets/countries/Canada.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "Poland",
    flag: "/assets/countries/Poland.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "Australia",
    flag: "/assets/countries/Australia.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "Czech-Republic",
    flag: "/assets/countries/Czech_Republic.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "India",
    flag: "/assets/countries/India.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "South_Korea",
    flag: "/assets/countries/South_Korea.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "Turkey",
    flag: "/assets/countries/Türkiye.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
  {
    country: "Brazil",
    flag: "/assets/countries/Brazil.webp",
    openvpn: true,
    ikev2: true,
    shadowsocks: true,
  },
];

  function checkCountryAvailability(countryName) {
  const normalized = countryName.trim().toLowerCase();
  const match = vpnData.find(({ country }) =>
    country.toLowerCase().replace(/[_-]/g, ' ') === normalized
  );

  if (match) {
    return "Yes, this server is available for you.";
  } else {
    return "That country is not currently available. Please leave feedback to request it.";
  }
}


    const CF_ACCOUNT_ID = "349395e7c3501afa6f87a9b3ba9f6472";
    const CF_API_TOKEN = "yr3h05ImkpjS-WJ1i2-SV0pCPDLTjjfb6XcWlEMz";
    const MODEL_NAME = "@cf/openchat/openchat-3.5-0106";

    const body = await request.json();
    const userPrompt = body.prompt;

    if (!userPrompt) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing prompt." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
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
- If a user asked for a required country to be added in this, tell the respected user to check if this country is present or not in our servers or tell them it will be added soon,please add a feedback there.

Country Availability Handling:
- If a user asks whether a specific country is available, check the internal list (vpnData).
- If the country exists, reply: "Yes, this server is available for you."
- If the country does not exist, reply: "That country is not currently available. Please leave feedback to request it."
- Always treat the country name as referring to Bolt VPN servers.

`;

    const fullPrompt = `${systemPrompt}\nUser: ${userPrompt}`;

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${MODEL_NAME}`,
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
        return new Response(
          JSON.stringify({ success: false, errors: data.errors }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
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
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
  },
};
