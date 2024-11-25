import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";

const maxRequestsPerIP = 100;
const ttl = 1 * 60 * 1000; 

const rateLimiter = new LRUCache<string, number>({
  max: 5000,
  ttl,
});

function getIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0] : "127.0.0.1";
}

export function middleware(request: NextRequest) {
  const ip = getIp(request);

  const requestCount = rateLimiter.get(ip) || 0;

  if (requestCount >= maxRequestsPerIP) {
    console.log(`Rate limit exceeded for IP: ${ip}`);
    return NextResponse.json(
      { error: "Too many requests, please try again later." },
      { status: 429 }
    );
  }

  rateLimiter.set(ip, requestCount + 1);

  console.log(`IP: ${ip}, Requests: ${requestCount + 1}`);
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*", 
};
