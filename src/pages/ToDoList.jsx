import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import Header from "../app/components/header";
import Footer from "../app/components/Footer";

const ToDoList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedNamaSurv, setSelectedNamaSurv] = useState("");
  const [selectedTanggal, setSelectedTanggal] = useState("");
  const [namaSurvOptions, setNamaSurvOptions] = useState([]);
  const [tanggalOptions, setTanggalOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const sheetID = process.env.NEXT_PUBLIC_SHEET_ID2;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const storedUsername = sessionStorage.getItem("username");

    if (!isLoggedIn) {
      router.push("/login");
    } else {
      setUsername(storedUsername || "User");
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("username");
    router.push("/login");
  };

  const fetchData = async () => {
    try {
      const [responseNamaSurv, responseTanggal, responseReasonSurv, resMain] =
        await Promise.all([
          axios.get(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/master!G3:G?key=${apiKey}`
          ),
          axios.get(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/master!B3:B?key=${apiKey}`
          ),
          axios.get(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/master!AR3:AR?key=${apiKey}`
          ),
          axios.get(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/master!A3:AR?key=${apiKey}`
          ),
        ]);

      const namaSurv = responseNamaSurv.data.values
        ? responseNamaSurv.data.values.flat()
        : [];
      const tanggal = responseTanggal.data.values
        ? responseTanggal.data.values.flat()
        : [];
      const reasonSurv = responseReasonSurv.data.values
        ? responseReasonSurv.data.values.flat()
        : [];

      setNamaSurvOptions([...new Set(namaSurv)]);
      setTanggalOptions(getUniqueAndSortedDays(tanggal));

      const responseMain = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/master!A3:AQ?key=${apiKey}`
      );
      const rowsMain = responseMain.data.values || [];

      const filteredRows = rowsMain.filter(
        (row) => row && row.length > 0 && row[0] !== ""
      );

      const formattedData = filteredRows.map((row, index) => {
        const indikator = row[25] || "";
        let ket = "";

        if (indikator === "EA-OT" || indikator === "D1-D3") {
          ket = "SUDAH BAYAR";
        } else if (indikator === "BAHAN") {
          ket = "BELUM BAYAR";
        } else if (indikator === "L1" || indikator === "L2-L5") {
          ket = "LOSS NBOT";
        }

        const namaSurveyor = namaSurv[index] || "Unknown Surveyor";
        const tanggalJatuhTempo = tanggal[index] || "Unknown Date";
        const reasonSurveyor = reasonSurv[index] || "";
        const rowsMain = resMain.data.values || [];

        return {
          no: index + 1 || "",
          noContract: row[0] || "",
          namaDealer: row[4] || "",
          rcac: row[7] || "",
          namaCustomer: row[9] || "",
          alamat: row[10] || "",
          noHp: row[21] || "",
          ecall: row[22] || "",
          angsuran: `${row[17] || ""} - ${row[15] || ""}`,
          historyPolaBayar: `${row[12] || ""}-${row[13] || ""}-${
            row[14] || ""
          }`,
          ket: ket,
          namaSurveyor: namaSurveyor,
          tanggalJatuhTempo: tanggalJatuhTempo,
          reasonSurv: reasonSurveyor,
          originalRowIndex: index + 3,
        };
      });

      setData(formattedData);
      setFilteredData(formattedData);
    } catch (error) {
      console.error("Error fetching data from Google Sheets:", error);
    }
  };

  const getUniqueAndSortedDays = (tanggalArray) => {
    const tanggalDays = tanggalArray
      .map((date) => {
        const day = date.split("/")[0];
        return parseInt(day, 10);
      })
      .filter((day) => day >= 1 && day <= 31);

    return [...new Set(tanggalDays)].sort((a, b) => a - b);
  };

  useEffect(() => {
    let filtered = data;

    if (selectedNamaSurv) {
      filtered = filtered.filter(
        (item) =>
          item.namaSurveyor?.toLowerCase() === selectedNamaSurv.toLowerCase()
      );
    }

    if (selectedTanggal) {
      filtered = filtered.filter(
        (item) => item.tanggalJatuhTempo === selectedTanggal
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [selectedNamaSurv, selectedTanggal, data]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getAccessToken = async () => {
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();
    return token.token;
  };

  const [fetchedData, setFetchedData] = useState([]);

  const fetchDataFromGoogleSheets = async () => {
    try {
      console.log("📡 Fetching latest data from Google Sheets...");
      const response = await axios.get("/api/update-status");

      // Pastikan data ada
      if (!response.data || !Array.isArray(response.data)) {
        console.error("❌ Invalid data received:", response.data);
        return;
      }

      console.log("✅ Full Data fetched:", response.data.length);

      const filteredData = response.data
        .map((item, index) => ({
          ...item,
          originalRowIndex: index + 3,
        }))
        .filter((item) => item.reasonSurv?.trim() !== "");

      console.log("✅ Filtered Data:", filteredData.length);

      setFetchedData(filteredData);
    } catch (error) {
      console.error(
        "❌ Error fetching data:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    fetchDataFromGoogleSheets();
  }, []);

  const handleStatusChange = async (rowIndex, newValue) => {
    const updatedRowIndex = filteredData[rowIndex]?.originalRowIndex;
    if (!updatedRowIndex) {
      console.error("❌ Error: Row index tidak ditemukan untuk update!");
      return;
    }

    console.log("📩 Sending request to API...");
    console.log("Row Index (Adjusted):", updatedRowIndex);
    console.log("New Value:", newValue);

    try {
      const response = await axios.put("/api/update-status", {
        rowIndex: updatedRowIndex,
        newValue,
      });

      if (response.data?.success) {
        console.log("✅ Update response:", response.data);

        setFilteredData((prevItems) =>
          prevItems.map((item, i) =>
            i === rowIndex ? { ...item, reasonSurv: newValue } : item
          )
        );

        await fetchDataFromGoogleSheets();
      } else {
        console.error("❌ API response error:", response.data);
      }
    } catch (error) {
      console.error("❌ Error updating Google Sheets:", error.message);
    }
  };

  return (
    <div>
      <Header />
      <div className="p-4 max-w-screen-2xl mx-auto">
        <div className="relative">
          <h1 className="bg-yellow-400 text-2xl font-bold text-center py-3 rounded-full shadow-md">
            To Do List
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Regional Field Verifier Name
            </label>
            <select
              value={selectedNamaSurv}
              onChange={(e) => setSelectedNamaSurv(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
            >
              <option value="">Pilih Nama</option>
              {namaSurvOptions.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Tanggal Jatuh Tempo
            </label>
            <select
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
            >
              <option value="">Pilih Tanggal</option>
              {tanggalOptions.map((date, index) => (
                <option key={index} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200 text-sm \">
              <tr>
                <th className="border border-gray-300 p-2 text-center">No</th>
                <th className="border border-gray-300 p-2 text-center">
                  No Contract
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  Nama Dealer
                </th>
                <th className="border border-gray-300 p-2 text-center">RCAC</th>
                <th className="border border-gray-300 p-2 text-center">
                  Nama Customer
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  Alamat
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  No HP
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  E-Call
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  Angsuran
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  History
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  Keterangan
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  Reason Surv
                </th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((item, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="border border-gray-300 p-2">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.noContract || "-"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.namaDealer || "-"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.rcac || "-"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.namaCustomer || "-"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.alamat || "-"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <a
                      href={`tel:${item.noHp}`}
                      className="text-blue-500 underline"
                    >
                      {item.noHp || "-"}
                    </a>
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.ecall || "-"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.angsuran || "-"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.historyPolaBayar || "-"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.ket || "-"}
                  </td>
                  <td className="border border-gray-300 p-2 px-10">
                    <select
                      value={item.reasonSurv}
                      onChange={(e) =>
                        handleStatusChange(index, e.target.value)
                      }
                      className="block w-full min-w-[150px] border border-gray-300 rounded-md p-2 justify-center items-center pr-5"
                    >
                      <option value="1. Gajian Mundur">1. Gajian Mundur</option>
                      <option value="2. Musibah (Meninggal Dunia, Sakit)">
                        2. Musibah (Meninggal Dunia, Sakit)
                      </option>
                      <option value="3. Uangnya Kepake Keperluan Lain">
                        3. Uangnya Kepake Keperluan Lain
                      </option>
                      <option value="4. Uang Belum Terkumpul">
                        4. Uang Belum Terkumpul
                      </option>
                      <option value="5. Atas Nama">5. Atas Nama</option>
                      <option value="6. Unit Tidak Ada (Raib, Gadai, Dijual, Pindah)">
                        6. Unit Tidak Ada (Raib, Gadai, Dijual, Pindah)
                      </option>
                      <option value="7. No Respon (Rumah Tutupan/WA Tidak Aktif)">
                        7. No Respon (Rumah Tutupan/WA Tidak Aktif)
                      </option>
                      <option value="8. Janji Bayar">8. Janji Bayar</option>
                      <option value="9. Sudah Bayar">9. Sudah Bayar</option>
                      <option value="BELUM VALIDASI">BELUM VALIDASI</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-between mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ToDoList;
