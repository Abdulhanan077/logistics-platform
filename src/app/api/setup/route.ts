import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create Super Admin
        const superAdmin = await prisma.user.upsert({
            where: { email: 'super@admin.com' },
            update: {},
            create: {
                email: 'super@admin.com',
                name: 'Super Admin',
                password: hashedPassword,
                role: 'SUPER_ADMIN',
            },
        });

        // Create Regular Admin for demo
        await prisma.user.upsert({
            where: { email: 'admin@demo.com' },
            update: {},
            create: {
                email: 'admin@demo.com',
                name: 'Demo Admin',
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        return NextResponse.json({
            message: "Setup Complete! You can now log in.",
            users: [
                { email: "super@admin.com", password: "password123", role: "Super Admin" },
                { email: "admin@demo.com", password: "password123", role: "Admin" }
            ]
        });
    } catch (error) {
        console.error("Setup Error:", error);
        return NextResponse.json({ error: "Failed to setup users" }, { status: 500 });
    }
}
