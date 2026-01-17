
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // Public endpoint for tracking page (fetching messages for a shipment)
    // In a real app, you might want to protect this with a token, but for now it's public if you know the ID/Tracking Number.
    // However, the ID (UUID) is hard to guess.

    try {
        const messages = await prisma.message.findMany({
            where: { shipmentId: id },
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(messages);
    } catch (e) {
        return new NextResponse("Error fetching messages", { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    try {
        const { content, sender } = await req.json();

        // Validation
        if (!content) return new NextResponse("Content required", { status: 400 });

        // Determine role:
        // If session exists and user is admin/super_admin, they can be "ADMIN".
        // Otherwise, it's a "CLIENT".

        let actualSender = "CLIENT";
        if (session && (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN')) {
            actualSender = "ADMIN";
            // If the request specifically says "ADMIN" and they are authorized, allow it.
        }

        const message = await prisma.message.create({
            data: {
                content,
                sender: actualSender,
                shipmentId: id
            }
        });

        return NextResponse.json(message);
    } catch (e) {
        console.error(e);
        return new NextResponse("Error sending message", { status: 500 });
    }
}
