import nodemailer from "nodemailer";

export type SuspiciousCheckInEmailPayload = {
  userDisplayName: string;
  attemptedClassName: string;
  attemptedBuildingName: string;
  actualNearbyBuildingName?: string | null;
  timestampIso: string;
  latitude: number;
  longitude: number;
  blocked: boolean;
};

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Missing Gmail credentials.");
  }

  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return cachedTransporter;
}

export async function sendSuspiciousCheckInEmail(
  recipientEmail: string,
  payload: SuspiciousCheckInEmailPayload,
) {
  const transporter = getTransporter();
  const subject = `Suspicious check-in alert for ${payload.userDisplayName}`;
  const actualBuildingLine = payload.actualNearbyBuildingName
    ? `Detected nearby building: ${payload.actualNearbyBuildingName}`
    : "Detected nearby building: Unknown";

  const text = [
    "Suspicious check-in detected",
    "",
    `Student: ${payload.userDisplayName}`,
    `Attempted class: ${payload.attemptedClassName}`,
    `Attempted building: ${payload.attemptedBuildingName}`,
    actualBuildingLine,
    `Timestamp: ${payload.timestampIso}`,
    `Coordinates: (${payload.latitude}, ${payload.longitude})`,
    `Result: ${payload.blocked ? "blocked" : "flagged"}`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Suspicious check-in detected</h2>
      <p><strong>Student:</strong> ${payload.userDisplayName}</p>
      <p><strong>Attempted class:</strong> ${payload.attemptedClassName}</p>
      <p><strong>Attempted building:</strong> ${payload.attemptedBuildingName}</p>
      <p><strong>Detected nearby building:</strong> ${payload.actualNearbyBuildingName ?? "Unknown"}</p>
      <p><strong>Timestamp:</strong> ${payload.timestampIso}</p>
      <p><strong>Coordinates:</strong> (${payload.latitude}, ${payload.longitude})</p>
      <p><strong>Result:</strong> ${payload.blocked ? "blocked" : "flagged"}</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: recipientEmail,
    subject,
    text,
    html,
  });
}
