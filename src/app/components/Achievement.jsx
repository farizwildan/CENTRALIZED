import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import DailyPerform from "../app/components/DailyPerform";
import MonthlyPerform from "../app/components/MonthlyPerform";
import Header from "../app/components/header";
import Footer from "../app/components/Footer";
import { useRouter } from "next/router";

const Achievement = () => {
  const [namaSurvOptions, setNamaSurvOptions] = useState([]);
  const [tanggalOptions, setTanggalOptions] = useState([]);
  const [selectedNamaSurv, setSelectedNamaSurv] = useState("");
  const [selectedTanggal, setSelectedTanggal] = useState("");
  const [dailyPerformData, setDailyPerformData] = useState(null);
  const [monthlyPerformData, setMonthlyPerformData] = useState(null);

  const sheetID = process.env.NEXT_PUBLIC_SHEET_ID2;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  useEffect(() => {
    fetchData();
  }, []);

  const router = useRouter();
  const [username, setUsername] = useState("");

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
        const filteredData = response.data.values.filter(
          (row) => row[6] === selectedNamaSurv
        );

        const filteredDataByTanggal = filteredData.filter(
          (row) =>
            parseInt(row[1].split("/")[0], 10) === parseInt(selectedTanggal, 10)
        );

        const kontrakBahanHariIni = filteredDataByTanggal.length;

        const responsePenyelesaian = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/master!A3:Z?key=${apiKey}`
        );

        let kontrakPenyelesaian = 0;

        if (responsePenyelesaian.data.values) {
          const penyelesaianFiltered = responsePenyelesaian.data.values.filter(
            (row) => {
              return (
                row[6] === selectedNamaSurv &&
                parseInt(row[1].split("/")[0], 10) ===
                  parseInt(selectedTanggal, 10)
              );
            }
          );

          penyelesaianFiltered.forEach((row) => {
            if (["EA-OT"].includes(row[25])) {
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
          if (["EA-OT", "L1", "L2-L5"].includes(row[25])) {
            penyelesaian++;
          } else if (["BAHAN", "D1-D3"].includes(row[25])) {
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
    <div>
      <Header />
      <div className="max-w-screen-xl mx-auto px-6 py-8 bg-gray-100 rounded-lg shadow-lg">
        {/* Form Input */}
        <div className="flex flex-col md:flex-row md:items-center mb-6 gap-3">
          {/* Regional Field Verifier Name */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Regional Field Verifier Name
            </label>
            <select
              value={selectedNamaSurv}
              onChange={(e) => setSelectedNamaSurv(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-64 focus:ring focus:ring-blue-300"
            >
              <option value="">Pilih Nama</option>
              {namaSurvOptions.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Date
            </label>
            <select
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-44 focus:ring focus:ring-blue-300"
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 mb-10 sm:mb-16">
          <DailyPerform data={dailyPerformData} />
          <MonthlyPerform data={monthlyPerformData} />
          {/* Character Image */}
          <Image
            src="/images/orang-merah.png"
            alt="Character"
            width={140}
            height={140}
            className="hidden sm:flex absolute bottom-[-38px] left-[160px]"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Achievement;
