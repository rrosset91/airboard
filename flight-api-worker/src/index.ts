export interface Env {
	FLIGHTLABS_API_KEY: string;
  }
  
  export default {
	async fetch(request: Request, env: Env): Promise<Response> {
	  const { searchParams } = new URL(request.url);
	  const iata = searchParams.get("iataCode") || searchParams.get("iata") || "";
	  const type = searchParams.get("type") || "departure";
	  const limit = searchParams.get("limit") || "50";
  
	  if (!iata) {
		return new Response("Missing iataCode param", { status: 400 });
	  }
  
	  const url = `https://api.goflightlabs.com/advanced-flights-schedules?access_key=${env.FLIGHTLABS_API_KEY}&iataCode=${iata}&type=${type}&limit=${limit}`;
  
	  // Opcional: proxy request com cache simples
	  // @ts-ignore: Cloudflare Workers global
	  const cache = (caches as any).default;
	  const cacheKey = new Request(url, request);
	  let response = await cache.match(cacheKey);
  
	  if (!response) {
		response = await fetch(url, { cf: { cacheTtl: 60 } } as any); // 1 min cache na edge
		await cache.put(cacheKey, response.clone());
	  }
  
	  return new Response(response.body, {
		status: response.status,
		headers: {
		  "Content-Type": "application/json",
		  "Access-Control-Allow-Origin": "*",
		}
	  });
	}
  }
  