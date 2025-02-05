import React from "react";

const DailyPerform = ({ data }) => {
  return (
    <div className="border-2 border-gray-400 rounded-lg p-6 relative bg-white shadow-lg w-full mb-4">
      <div className="absolute top-[-14px] left-4 bg-blue-700 text-white px-4 py-1 text-sm font-bold rounded-lg shadow-md">
        Daily Perform
      </div>

      <p className="text-sm text-gray-700 mt-2">
        Berikut merupakan highlights performa kamu hari ini:
      </p>

      <div className="flex items-center mt-3">
        <div className="flex items-center mr-4">
          <div className="bg-blue-700 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-lg">
            {data ? data.kontrakHariIni : "0"}
          </div>
          <div className="ml-2 text-sm">
            <span className="font-bold text-blue-700">Kontrak</span>
            <br />
            <span className="text-gray-600 text-xs">Bahan Hari Ini</span>
          </div>
        </div>

        <div className="flex items-center">
          <div className="bg-blue-700 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-lg">
            {data ? data.penyelesaian : "0"}
          </div>
          <div className="ml-2 text-sm">
            <span className="font-bold text-blue-700">Kontrak</span>
            <br />
            <span className="text-gray-600 text-xs">Penyelesaian</span>
          </div>
        </div>
      </div>

      <div className="mt-3 text-right">
        <span className="text-2xl font-bold text-blue-700">
          {data ? `${data.achievement}%` : "0%"}
        </span>
        <br />
        <span className="text-gray-700 font-semibold">Achievements</span>
      </div>
    </div>
  );
};

export default DailyPerform;
