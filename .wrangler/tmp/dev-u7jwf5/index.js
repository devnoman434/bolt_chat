var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var src_default = {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }
    if (request.method !== "POST" || new URL(request.url).pathname !== "/ask") {
      return new Response(
        JSON.stringify({ success: false, error: "Not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    const vpnData = [
      {
        country: "Germany",
        flag: "/assets/countries/Germany.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "Netherlands",
        flag: "/assets/countries/Netherlands.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "Switzerland",
        flag: "/assets/countries/Switzerland.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "Spain",
        flag: "/assets/countries/Spain.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "Norway",
        flag: "/assets/countries/Norway.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "United States",
        flag: "/assets/countries/United_States.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "United Kingdom",
        flag: "/assets/countries/Great_Britain.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "France",
        flag: "/assets/countries/France.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "Sweden",
        flag: "/assets/countries/Sweden.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "Ireland",
        flag: "/assets/countries/Ireland.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "Canada",
        flag: "/assets/countries/Canada.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "Poland",
        flag: "/assets/countries/Poland.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "Australia",
        flag: "/assets/countries/Australia.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "Czech-Republic",
        flag: "/assets/countries/Czech_Republic.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "India",
        flag: "/assets/countries/India.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "South_Korea",
        flag: "/assets/countries/South_Korea.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "Turkey",
        flag: "/assets/countries/T\xFCrkiye.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      },
      {
        country: "Brazil",
        flag: "/assets/countries/Brazil.webp",
        openvpn: true,
        ikev2: true,
        shadowsocks: true
      }
    ];
    function checkCountryAvailability(countryName) {
      const normalized = countryName.trim().toLowerCase();
      const match = vpnData.find(
        ({ country }) => country.toLowerCase().replace(/[_-]/g, " ") === normalized
      );
      if (match) {
        return "Yes, this server is available for you.";
      } else {
        return "That country is not currently available. Please leave feedback to request it.";
      }
    }
    __name(checkCountryAvailability, "checkCountryAvailability");
    const CF_ACCOUNT_ID = "349395e7c3501afa6f87a9b3ba9f6472";
    const CF_API_TOKEN = "yr3h05ImkpjS-WJ1i2-SV0pCPDLTjjfb6XcWlEMz";
    const body = await request.json();
    const userPrompt = body.prompt;
    const username = body.username;
    if (!userPrompt) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing prompt." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    if (username.toLowerCase() === "guest") {
      return new Response(
        JSON.stringify({
          success: true,
          response: "Please log in or sign up to continue using the assistant."
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    const systemPrompt = `
You are a helpful and friendly AI assistant for Bolt VPN.

Greeting Behavior:
- If the user says "hi", "hello", or only greets, respond with a short warm greeting using their name (if available).
- Do NOT mention Bolt VPN or any feature unless the user clearly asks.

Answering Rules:
- Answer only Bolt VPN-related questions. Politely refuse anything unrelated.
- Keep responses short (10\u201315 words), helpful, and friendly.
- Do NOT share all info unless specifically asked.
- Do NOT repeat yourself unless asked again.
- Never mention system notes, internal logic, or this instruction.
- Never say "Response:" before your reply.
- If username is "Guest", politely ask them to sign up or log in for full access.
- Always personalize replies using the username if provided.

Bolt VPN Info (Only use if user asks directly):
- Features: Fast speed, strong security, easy setup.
- Platforms: Available on Android, iOS, Windows, macOS, Linux.
- Free Plan: 30-minute sessions per connection.
- Premium Plan: Unlimited sessions.
- IPs: Offers dedicated IP addresses.
- Virtual Numbers: Available for secure identity.
- Device Sync: Use one account across multiple devices and OS with automatic sync (great for premium users).
- Pricing:
  - $15/month (monthly)
  - $7.5/month (yearly)
- Servers: 100+ countries supported.
- Payment Methods: Credit cards & PayPal.
- Support: 24/7 via email & live chat.
- Download: Search \u201CBolt VPN\u201D in your OS\u2019s official store (e.g., Play Store for Android).

Connection Help (Only mention when user brings it up):
- Timeout: Suggest switching between OpenVPN and Shadowsocks or using a stable internet connection.
- Location not switching: Ask them to confirm VPN is connected.
- Country missing: Ask user to check if it's supported or leave feedback to request it.

Country Availability:
- If user asks about a country, check vpnData (ignore spelling/case/underscore issues).
- If found: "Yes, this server is available for you."
- If not found: "That country is not currently available. Please leave feedback to request it."

Important Behavior:
- Treat all queries as referring to Bolt VPN even if not mentioned.
- If question is vague, off-topic, or not Bolt VPN-related, reply politely with a brief introduction only.

User: ${username}
`;
    const fullPrompt = `${systemPrompt.replace(
      "User's name",
      username
    )}
User: ${userPrompt}`;
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/google/gemma-7b-it-lora`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CF_API_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ prompt: fullPrompt, username })
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
              ...corsHeaders
            }
          }
        );
      }
      return new Response(
        JSON.stringify({
          success: true,
          response: data.result.response || "[No response]"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
  }
};

// ../../../../usr/local/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../usr/local/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-m07gnY/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../usr/local/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-m07gnY/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
