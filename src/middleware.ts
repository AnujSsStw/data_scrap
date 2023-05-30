import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/sign-in*", "/sign-up*", "/api/*"];

const isPublic = (path: string) => {
  return publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", "($|/|\\.)")))
  );
};

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  if (isPublic(request.nextUrl.pathname)) {
    console.log("public path");
    return NextResponse.next();
  }

  //todo
  //   const token = false;
  //   if (!token) {
  //     return NextResponse.redirect(process.env.AUTH_UI as string);
  //   }

  return NextResponse.next();
}

// Stop Middleware running on static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next
     * - static (static files)
     * - favicon.ico (favicon file)
     */
    "/(.*?trpc.*?|(?!static|.*\\..*|_next|favicon.ico).*)",
    "/",
  ],
};
