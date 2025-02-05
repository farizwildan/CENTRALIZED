import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

const Dashboard = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const storedUsername = sessionStorage.getItem("username");

    if (!isLoggedIn) {
      router.push("/login"); // Redirect jika belum login
    } else {
      setUsername(storedUsername || "User");
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("username");
    router.push("/login");
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 text-blue-900">
      {/* Navbar */}
      <div className="flex justify-between items-center py-4">
        <h1 className="text-xl font-semibold text-blue-700">
          Hello, {username}!
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Heading Section */}
      <div className="text-center mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-4xl font-bold text-blue-800 mb-1 sm:mb-2">
          Welcome to <span className="text-blue-600">BOOZT!</span>
        </h1>
        <p className="text-sm sm:text-lg text-gray-600">
          by Surabaya Credit Central Region
        </p>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 mb-5 sm:mb-5">
        {/* Card for Achievements */}
        <Link href="/Achievement" passHref>
          <div className="bg-yellow-300 rounded-lg sm:p-6 shadow-md flex flex-row items-center pr-2 sm:gap-6 relative cursor-pointer hover:bg-yellow-400 transition duration-200 ease-in-out">
            <div className="relative flex-shrink-0">
              <Image
                src="/images/merah.png"
                alt="Achievements Recapitulation"
                width={100}
                height={120}
                className="pt-3 w-36 h-36 sm:w-48 sm:h-48 object-contain"
              />
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <h2 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2">
                Achievements Recapitulation
              </h2>
              <p className="text-sm sm:text-base text-gray-700">
                Lihat report achievements mu disini!
              </p>
            </div>
          </div>
        </Link>

        {/* Card for To Do List */}
        <Link href="/ToDoList" passHref>
          <div className="bg-orange-300 rounded-lg sm:p-6 shadow-md flex flex-row items-center pl-3 sm:gap-3 relative cursor-pointer hover:bg-orange-400 transition duration-200 ease-in-out">
            <div className="mt-3 sm:mt-0 sm:ml-6 text-white text-center sm:text-left">
              <h2 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2">
                To Do List
              </h2>
              <p className="text-sm sm:text-base">
                Daftar konsumen yang harus di follow up hari ini!
              </p>
            </div>
            <div className="relative flex-shrink-0">
              <Image
                src="/images/biru.png"
                alt="To Do List"
                width={100}
                height={100}
                className="w-36 h-36 sm:w-48 sm:h-48 object-contain"
              />
            </div>
          </div>
        </Link>
      </div>

      {/* FIFGROUP Logo Section */}
      <div className="flex justify-center mt-2 sm:mt-16">
        <Image
          src="/images/FIF.png"
          alt="FIFGROUP"
          width={100}
          height={100}
          className="w-20 h-20 sm:w-36 sm:h-36 object-contain"
        />
      </div>
    </div>
  );
};

export default Dashboard;
