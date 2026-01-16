import { Resend } from 'resend';


const FROM_EMAIL = 'onboarding@resend.dev'; // Default Resend testing email

interface EmailParams {
    to: string;
    trackingNumber: string;
    status: string;
    location?: string;
    description?: string;
}

export async function sendShipmentEmail({ to, trackingNumber, status, location, description }: EmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email.');
        return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const trackingUrl = `${process.env.NEXTAUTH_URL}/track/${trackingNumber}`;
        const subject = `Shipment Update: ${trackingNumber} is ${status}`;

        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #1e293b;">Shipment Update</h2>
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #64748b;">Tracking Number</p>
                    <p style="margin: 4px 0 0; font-size: 18px; font-weight: bold; color: #0f172a;">${trackingNumber}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p style="font-size: 16px; color: #334155;">
                        Your shipment status has changed to: <strong style="color: #2563eb;">${status}</strong>
                    </p>
                    ${location ? `<p style="color: #64748b;">Location: ${location}</p>` : ''}
                    ${description ? `<p style="color: #64748b;">Note: ${description}</p>` : ''}
                </div>

                <a href="${trackingUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Track Shipment
                </a>

                <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">
                    Atlas Logistics Platform
                </p>
            </div>
        `;

        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject: subject,
            html: html,
        });

        console.log(`Email sent to ${to} for shipment ${trackingNumber}`, data);
        return data;
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}
