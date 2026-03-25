export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const { pathname } = new URL(request.url);
    if (request.method !== "POST" || pathname !== "/ask") {
      return new Response(JSON.stringify({ success: false }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 🔐 Your credentials
    const CF_ACCOUNT_ID = "YOUR_ACCOUNT_ID";
    const CF_API_TOKEN = "YOUR_API_TOKEN";

    // 📚 Knowledge Base (RAG)
    const knowledgeBase = [
      "Bolt VPN pricing is $15 monthly or $7.5 per month yearly.",
      "Bolt VPN offers fast speeds, strong encryption, and easy setup.",
      "Bolt VPN supports Android, iOS, Windows, macOS, and Linux.",
      "Free plan allows 30-minute sessions per connection.",
      "Premium plan includes unlimited sessions and device sync.",
      "Bolt VPN has servers in over 100 countries worldwide.",
      "Users can pay via credit card or PayPal.",
      "Support is available 24/7 via chat and email.",
    ];

    // 🧠 Parse request
    const body = await request.json();
    const { prompt: userPrompt, username = "Guest", history = [] } = body;

    if (!userPrompt) {
      return new Response(JSON.stringify({ success: false }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // ❌ Guest block
    if (username.toLowerCase() === "guest") {
      return new Response(
        JSON.stringify({
          success: true,
          response: "Please log in to use the assistant.",
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 🔍 Get embedding
    async function getEmbedding(text) {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/baai/bge-base-en-v1.5`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        }
      );

      const data = await res.json();
      return data.result.data[0];
    }

    // 📏 Cosine similarity
    function cosineSimilarity(a, b) {
      const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return dot / (magA * magB);
    }

    // 🧠 RAG context
    async function getContext(userPrompt) {
      const userEmbedding = await getEmbedding(userPrompt);

      const scored = await Promise.all(
        knowledgeBase.map(async (text) => {
          const emb = await getEmbedding(text);
          return {
            text,
            score: cosineSimilarity(userEmbedding, emb),
          };
        })
      );

      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map((x) => x.text)
        .join("\n");
    }

    const context = await getContext(userPrompt);

    // 🧠 Memory
    const formattedHistory = history
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    // ✨ Clean prompt
    const finalPrompt = `
You are Bolt VPN AI assistant.

Rules:
- Be friendly and human-like
- Answer in 1–2 short sentences
- Use user's name
- Only answer VPN-related questions

Context:
${context}

Conversation:
${formattedHistory}

User (${username}): ${userPrompt}
Assistant:
`;

    // 🤖 LLM call
    const aiRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: finalPrompt }),
      }
    );

    const aiData = await aiRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        response: aiData.result?.response || "No response",
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  },
};