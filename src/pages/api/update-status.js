import { google } from "googleapis";
import path from "path";

const fetchDataFromGoogleSheets = async () => {
    try {
        console.log("📡 Fetching latest data from Google Sheets...");
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), "src/config/service-account.json"),
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        // Example: Fetching data from a specific range in Google Sheets
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.NEXT_PUBLIC_SHEET_ID2,
            range: "master!AR3:AR",  // Change this range as needed
        });

        console.log("✅ Data fetched from Google Sheets:", response.data);
        return response.data.values;  // Return the fetched values
    } catch (error) {
        console.error("❌ Error fetching data from Google Sheets:", error.message);
        throw new Error("Failed to fetch data from Google Sheets");
    }
};

export default async function handler(req, res) {
    console.log("📩 Received API request:", req.method);

    if (req.method !== "PUT") {
        console.log("❌ Invalid method:", req.method);
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { rowIndex, newValue } = req.body;
        console.log("🔄 Data received:", { rowIndex, newValue });

        // Validation for missing rowIndex or newValue
        if (rowIndex == null || newValue == null) {
            console.error("⚠️ Missing rowIndex or newValue!");
            return res.status(400).json({ error: "Invalid request data" });
        }

        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS),
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        console.log("📊 Updating Google Sheets at row:", rowIndex);

        // Update Google Sheets at specified row and column (AR for Reason Surv)
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.NEXT_PUBLIC_SHEET_ID2,
            range: `master!AR${rowIndex}`, // Kolom AR tempat Reason Surv
            valueInputOption: "USER_ENTERED",
            resource: { values: [[newValue]] },
        });

        console.log("✅ Google Sheets update response:", response.data);
        res.status(200).json({ success: true, message: "Status updated successfully!" });
    } catch (error) {
        console.error("❌ Error updating status:", error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
