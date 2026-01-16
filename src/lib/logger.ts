import prisma from "@/lib/prisma";

export async function logAction(adminId: string, action: string, entityId: string, details?: any) {
    try {
        await prisma.auditLog.create({
            data: {
                adminId,
                action,
                entityId,
                details: details ? JSON.stringify(details) : undefined
            }
        });
    } catch (error) {
        console.error("Failed to create audit log:", error);
        // We don't throw here to avoid failing the main action if logging fails
    }
}
