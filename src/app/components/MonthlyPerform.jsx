import React from "react";

const MonthlyPerform = ({ data }) => {
  return (
    <div className="border-2 border-gray-400 rounded-lg p-6 relative bg-white shadow-lg w-full">
      {/* Header */}
      <span className="absolute -top-4 left-4 bg-blue-700 text-white px-4 py-1 text-sm font-bold rounded-lg shadow-md">
        Monthly Perform
      </span>

      <p className="text-sm text-gray-700 mt-6">
        Berikut merupakan highlights performa kamu bulan ini:
      </p>

      {/* Statistik */}
      <div className="flex flex-col mt-4 text-center">
        <div className="py-2 bg-gray-100 font-semibold rounded-md shadow-sm">
          Total Bahan <br />
          <span className="text-xl font-bold">
            {data ? data.totalKontrak : "0"} Kontrak
          </span>
        </div>
        <div className="py-2 mt-2 bg-gray-100 font-semibold rounded-md shadow-sm">
          Penyelesaian <br />
          <span className="text-xl font-bold">
            {data ? data.penyelesaian : "0"} Kontrak
          </span>
        </div>
        <div className="py-2 mt-2 bg-gray-100 font-semibold rounded-md shadow-sm">
          Sisa Bahan <br />
          <span className="text-xl font-bold">
            {data ? data.sisaBahan : "0"} Kontrak
          </span>
        </div>
      </div>

      {/* Achievements NBOT */}
      <div className="mt-6 text-center">
        <p className="text-yellow-500 font-bold text-lg">Achievements NBOT</p>
        <span className="text-4xl font-bold text-black bg-yellow-300 px-4 py-1 rounded-lg shadow-md">
          {data ? `${data.achievement.toFixed(2)}%` : "0.00%"}
        </span>
        <p className="text-sm text-gray-600 mt-2">Penyelesaian Menuju Target</p>
        <p className="text-green-600 font-bold text-lg">
          {data ? data.penyelesaianMenujuTarget : "TARGET!"}
        </p>
      </div>
    </div>
  );
};

export default MonthlyPerform;
