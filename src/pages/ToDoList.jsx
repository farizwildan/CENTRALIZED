import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
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
  const [itemsPerPage] = useState(10); // Jumlah item per halaman

  const sheetID = "1y35T2Jq50E5DViOZ2V5YjsKVIO-fECa9GU_2KXZTJGA";
  const apiKey = "AIzaSyB25avskYJrDJ4b-nkuQNp93LsiPhcSMB4";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [responseNamaSurv, responseTanggal] = await Promise.all([
        axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/master!G3:G?key=${apiKey}`
        ),
        axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/master!B3:B?key=${apiKey}`
        ),
      ]);

      const namaSurv = responseNamaSurv.data.values
        ? responseNamaSurv.data.values.flat()
        : [];
      const tanggal = responseTanggal.data.values
        ? responseTanggal.data.values.flat()
        : [];

      setNamaSurvOptions([...new Set(namaSurv)]);
      setTanggalOptions(getUniqueAndSortedDays(tanggal));

      const responseMain = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/master!A3:AQ?key=${apiKey}`
      );
      const rowsMain = responseMain.data.values || [];

      console.log("Rows Main Length:", rowsMain.length);
      console.log("Nama Surveyor Length:", namaSurv.length);
      console.log("Tanggal Length:", tanggal.length);

      const filteredRows = rowsMain.filter(
        (row) => row && row.length > 0 && row[0] !== ""
      ); // Memfilter baris kosong

      const formattedData = filteredRows.map((row, index) => {
        // Logic untuk memformat data
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
        };
      });

      console.log("Formatted Data:", formattedData);
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
    setCurrentPage(1); // Reset ke halaman pertama setelah filter
  }, [selectedNamaSurv, selectedTanggal, data]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div>
      <Header />
      <div className="p-4 max-w-screen-xl mx-auto">
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

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200 text-sm">
              <tr>
                <th className="border border-gray-300 p-2">No</th>
                <th className="border border-gray-300 p-2">No Contract</th>
                <th className="border border-gray-300 p-2">Nama Dealer</th>
                <th className="border border-gray-300 p-2">RCAC</th>
                <th className="border border-gray-300 p-2">Nama Customer</th>
                <th className="border border-gray-300 p-2">Alamat</th>
                <th className="border border-gray-300 p-2">No HP</th>
                <th className="border border-gray-300 p-2">E-Call</th>
                <th className="border border-gray-300 p-2">Angsuran</th>
                <th className="border border-gray-300 p-2">History</th>
                <th className="border border-gray-300 p-2">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  {/* Penomoran dimulai dari 1 sesuai indeks data yang difilter */}
                  <td className="border border-gray-300 p-2">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.noContract}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.namaDealer}
                  </td>
                  <td className="border border-gray-300 p-2">{item.rcac}</td>
                  <td className="border border-gray-300 p-2">
                    {item.namaCustomer}
                  </td>
                  <td className="border border-gray-300 p-2">{item.alamat}</td>
                  <td className="border border-gray-300 p-2">
                    <a
                      href={`tel:${item.noHp}`}
                      className="text-blue-500 underline"
                    >
                      {item.noHp}
                    </a>
                  </td>
                  <td className="border border-gray-300 p-2">{item.ecall}</td>
                  <td className="border border-gray-300 p-2">
                    {item.angsuran}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.historyPolaBayar}
                  </td>
                  <td className="border border-gray-300 p-2">{item.ket}</td>
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
