import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function testGoogle() {

  const { verifyGoogleToken } = await import("./infrastructure/external-services/google.service");

  const idToken ="eyJhbGciOiJSUzI1NiIsImtpZCI6IjgwNzZkZGJhYjQxNTU1NmUxNjkxNTRjNmE0YTBiZGJkNDQ2OWI3OWMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDUzNzU4MjM2NTY1OTA5Mzk2MjUiLCJlbWFpbCI6InJpc2Fuc2FkaWtAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJsM1JKQTVQRVY4MFl3dlJwWDNaU0pnIiwibmFtZSI6IlJpc2FuIEJpbiBTYWRpayIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJWHZLOHl5S0ZFcHRkeW5scWVjVHFrVTZXV0ZOVnRfblplQ0ViY1Jyek1PUkhMUGJZPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IlJpc2FuIiwiZmFtaWx5X25hbWUiOiJCaW4gU2FkaWsiLCJpYXQiOjE3Nzg1MjgzMzgsImV4cCI6MTc3ODUzMTkzOH0.ag7VOzEju6KfpNjmufz9luzyoQMUsQNHR9GEUtZOl1YgGLCWlda6uv4vCHxQCPmoMlvtnoC9l1SmMKBTfYjbet6Q0QxNLkwHwBjfeC-WFleX6iIRUJHgBzFwuhrMd-zwfb1XfPv1KwYRV-pFemtcJ8w3y1cs-YCgzNOXsqUkWvBipqV7EUVmi8jEUp8W9KcylKCw19B-HeZ9ArxaglubCKbv73hFqXPvSmcWjk1-fRE1kWY-niLyWmwVw7GMd_e7VVjSc5Qw7weaG-KBjMnNi3XuOU7kgo9ZQ3TU8sXvuBN53pkv7bxEm-7os1a997M2W8fW0P9pcdR6v6DsdYEGbw"; // Put the token from Playground here

  try {
    console.log("🚀 Verifying Google Token...");
    const user = await verifyGoogleToken(idToken);
    console.log("✅ Success! Google User Data:", user);
  } catch (error: any) {
    console.error("❌ Verification Failed:", error.message);
  }
}

testGoogle();
