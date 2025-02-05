import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import DailyPerform from "./DailyPerform";
import MonthlyPerform from "./MonthlyPerform"; // Import MonthlyPerform

const Achievement = ({ sheetID, apiKey }) => {
  const [namaSurvOptions, setNamaSurvOptions] = useState([]);
  const [tanggalOptions, setTanggalOptions] = useState([]);
  const [selectedNamaSurv, setSelectedNamaSurv] = useState("");
  const [selectedTanggal, setSelectedTanggal] = useState("");
  const [dailyPerformData, setDailyPerformData] = useState(null);
  const [monthlyPerformData, setMonthlyPerformData] = useState(null); // State baru

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedNamaSurv && selectedTanggal) {
      fetchDailyPerform();
      fetchMonthlyPerform();
    }
  }, [selectedNamaSurv, selectedTanggal]);

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
    } catch (error) {
      console.error("Error fetching data from Google Sheets:", error);
    }
  };

  const fetchDailyPerform = async () => {
    try {
      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/master!A3:AQ?key=${apiKey}`
      );

      if (response.data.values) {
        // Filter berdasarkan nama surveyor (kolom G) dan tanggal (kolom B)
        const filteredData = response.data.values.filter(
          (row) => row[6] === selectedNamaSurv // Kolom G = Nama Surveyor
        );

        // Filter berdasarkan tanggal (Kolom B) - hanya tanggal yang sesuai yang akan dipilih
        const filteredDataByTanggal = filteredData.filter(
          (row) =>
            parseInt(row[1].split("/")[0], 10) === parseInt(selectedTanggal, 10) // Kolom B = Tanggal
        );

        const kontrakBahanHariIni = filteredDataByTanggal.length;

        // Ambil data dari kolom Z untuk penyelesaian kontrak
        const responsePenyelesaian = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/master!A3:Z?key=${apiKey}`
        );

        let kontrakPenyelesaian = 0;

        if (responsePenyelesaian.data.values) {
          // Filter untuk mencocokkan data penyelesaian berdasarkan Nama Surveyor dan Tanggal
          const penyelesaianFiltered = responsePenyelesaian.data.values.filter(
            (row) => {
              // Pastikan nama surveyor dan tanggalnya cocok dengan filteredData
              return (
                row[6] === selectedNamaSurv && // Kolom G = Nama Surveyor
                parseInt(row[1].split("/")[0], 10) ===
                  parseInt(selectedTanggal, 10) // Kolom B = Tanggal
              );
            }
          );

          // Hitung penyelesaian kontrak yang sesuai
          penyelesaianFiltered.forEach((row) => {
            if (["EA-OT", "D1-D3"].includes(row[25])) {
              kontrakPenyelesaian++;
            }
          });
        }

        console.log(
          "Filtered Data (By Nama & Tanggal):",
          filteredDataByTanggal
        );
        console.log(
          "Filtered Penyelesaian Data:",
          responsePenyelesaian.data.values
        );

        const achievement =
          kontrakBahanHariIni > 0
            ? (kontrakPenyelesaian / kontrakBahanHariIni) * 100
            : 0;

        setDailyPerformData({
          kontrakHariIni: kontrakBahanHariIni,
          penyelesaian: kontrakPenyelesaian,
          achievement: achievement.toFixed(2),
        });
      }
    } catch (error) {
      console.error("Error fetching daily performance:", error);
    }
  };

  const fetchMonthlyPerform = async () => {
    try {
      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/master!A3:Z?key=${apiKey}`
      );

      if (response.data.values) {
        const filteredData = response.data.values.filter(
          (row) => row[6] === selectedNamaSurv
        );

        const totalKontrak = filteredData.length;

        let penyelesaian = 0;
        let sisaBahan = 0;

        filteredData.forEach((row) => {
          if (["EA-OT", "D1-D3", "L1", "L2-L5"].includes(row[25])) {
            penyelesaian++;
          } else if (["BAHAN"].includes(row[25])) {
            sisaBahan++;
          }
        });

        const achievement =
          totalKontrak > 0 ? (penyelesaian / totalKontrak) * 100 : 0;

        let penyelesaianMenujuTarget;
        const target = totalKontrak * 0.88;

        if (achievement >= 88) {
          penyelesaianMenujuTarget = "TARGET!";
        } else {
          penyelesaianMenujuTarget = `Perlu ${Math.ceil(
            target - penyelesaian
          )} lagi untuk mencapai TARGET!`;
        }

        setMonthlyPerformData({
          totalKontrak,
          penyelesaian,
          sisaBahan,
          achievement,
          penyelesaianMenujuTarget,
        });
      } else {
        setMonthlyPerformData(null);
      }
    } catch (error) {
      console.error("Error fetching monthly performance:", error);
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

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8 bg-gray-100 rounded-lg shadow-lg">
      {/* Form Input */}
      <div className="flex justify-start items-center mb-6 gap-3">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Regional Field Verifier Name
          </label>
          <select
            value={selectedNamaSurv}
            onChange={(e) => setSelectedNamaSurv(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring focus:ring-blue-300"
          >
            <option value="">Pilih Nama</option>
            {namaSurvOptions.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Date
          </label>
          <select
            value={selectedTanggal}
            onChange={(e) => setSelectedTanggal(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-44 focus:ring focus:ring-blue-300"
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

      {/* Performance Cards */}
      <div className="grid grid-cols-2 gap-8 mt-6 relative">
        <DailyPerform data={dailyPerformData} />
        <MonthlyPerform data={monthlyPerformData} />
        {/* Character Image */}
        <Image
          src="/images/orang-merah.png"
          alt="Character"
          width={140}
          height={140}
          className="absolute bottom-[-0px] left-[20px]"
        />
      </div>
    </div>
  );
};

export default Achievement;
