import { google } from "googleapis";
import path from "path";


const getAuthClient = () => {
    try {
        // Coba parse `GOOGLE_CLOUD_CREDENTIALS`
        const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
        console.log("✅ Parsed Credentials:", credentials);

        // Pastikan `private_key` diformat dengan benar
        credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
        console.log("🔑 Private Key Length:", credentials.private_key.length);

        return new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
    } catch (error) {
        console.error("❌ Error parsing GOOGLE_CLOUD_CREDENTIALS:", error.message);
        throw new Error("Invalid GOOGLE_CLOUD_CREDENTIALS format");
    }
};

const fetchDataFromGoogleSheets = async () => {
    try {
        console.log("📡 Fetching latest data from Google Sheets...");

        const auth = getAuthClient();
        const sheets = google.sheets({ version: "v4", auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.NEXT_PUBLIC_SHEET_ID2,
            range: "master!AR3:AR", // Pastikan range sesuai dengan data yang ingin diambil
        });

        console.log("✅ Data fetched from Google Sheets:", response.data);
        return response.data.values;
    } catch (error) {
        console.error("❌ Error fetching data from Google Sheets:", error.message);
        throw new Error("Failed to fetch data from Google Sheets");
    }
};

export default async function handler(req, res) {
    console.log("📩 Received API request:", req.method);
    console.log("Request received:", req.method, req.body);
    if (req.method === "GET") {
        try {
            const data = await fetchDataFromGoogleSheets();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch data from Google Sheets" });
        }
        return;
    }

    if (req.method === "PUT") {
        try {
            const { rowIndex, newValue } = req.body;
            console.log("🔄 Data received:", { rowIndex, newValue });
            console.log("Preparing to update at range:", `master!AR${rowIndex}`);

            // Validasi data yang diterima
            if (typeof rowIndex !== "number" || !newValue || typeof newValue !== "string") {
                console.error("⚠️ Invalid data:", { rowIndex, newValue });
                return res.status(400).json({ error: "Invalid request data" });
            }

            const auth = new google.auth.GoogleAuth({
                credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS),
                scopes: ["https://www.googleapis.com/auth/spreadsheets"],
            });

            const sheets = google.sheets({ version: "v4", auth });

            console.log("📊 Updating Google Sheets at row:", rowIndex);

            // Update data di Google Sheets
            const response = await sheets.spreadsheets.values.update({
                spreadsheetId: process.env.NEXT_PUBLIC_SHEET_ID2,
                range: `master!AR${rowIndex}`, // Kolom AR adalah kolom Reason Surv
                valueInputOption: "USER_ENTERED",
                resource: { values: [[newValue]] },
            });

            console.log("✅ Google Sheets update response:", response.data);
            res.status(200).json({ success: true, message: "Status updated successfully!" });
        } catch (error) {
            console.error("❌ Error updating status:", error.message);
            res.status(500).json({ error: "Internal Server Error", details: error.message });
        }
    } else {
        // Method tidak valid
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
