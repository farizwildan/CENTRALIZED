"use client"; // Next.js 13+ menggunakan "use client" agar state berfungsi
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import "@/styles/globals.css";

const LoginForm = () => {
  const [username, setUsername] = useState(""); // Nama sebagai username
  const [password, setPassword] = useState(""); // NPK sebagai password
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const sheetID = process.env.NEXT_PUBLIC_SHEET_ID;
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;

      // Ambil data user dari Google Sheets
      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/Sheet1!A2:B?key=${apiKey}`
      );

      const users = response.data.values || [];

      // Cek apakah username (Nama) dan password (NPK) cocok
      const user = users.find(
        (row) => row[0] === username && row[1] === password // Nama = row[0] dan NPK = row[1]
      );

      if (user) {
        // Simpan data di sessionStorage / localStorage
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("username", username); // Menyimpan Nama sebagai username
        router.push("/dashboard"); // Redirect ke dashboard
      } else {
        setError("Username atau password salah!");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Gagal menghubungkan ke server.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          {/* Logo atau Judul */}
          <img
            src="/images/central.png" // Ganti dengan logo yang sesuai
            alt="Logo"
            className="w-24 h-24 mb-4"
          />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Nama (Username)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
              placeholder="Masukkan Nama"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              NPK/NPO (Password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
              placeholder="Masukkan NPK/NPO"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 transform hover:scale-105"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
