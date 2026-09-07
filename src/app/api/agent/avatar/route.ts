import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  
  const agent = await prisma.agent.findUnique({ 
    where: { id: session.user.id }, 
    select: { avatarUrl: true } 
  });
  
  if (!agent?.avatarUrl) return new Response("Not found", { status: 404 });
  
  const matches = agent.avatarUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    // If it's a regular URL, redirect to it
    if (agent.avatarUrl.startsWith("http")) {
      return Response.redirect(agent.avatarUrl);
    }
    return new Response("Invalid image format", { status: 500 });
  }
  
  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], "base64");
  
  return new Response(buffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
