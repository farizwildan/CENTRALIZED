import React from "react";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <nav className="relative flex justify-between items-center bg-blue-900 text-white pl-10 rounded-full mb-6">
      {/* Bagian Kiri - Logo dan Teks */}

      <div className="flex items-center space-x-4">
        <Link href="/dashboard" passHref>
          <Image
            src="/images/CENTRALSBY.png"
            alt="Centralized Logo"
            width={100}
            height={100}
          />
        </Link>
        {/* Teks BOOZTI dan Slogan */}
        <div>
          <h1 className="text-2xl font-bold text-white">BOOST!</h1>
          <p className="text-sm italic">
            Be the One, Optimize, Organize, Speed-up, Target!
          </p>
        </div>
      </div>

      {/* Bagian Kanan - Logo FIFGROUP dan Teks */}
      <div className="hidden sm:flex items-center">
        <div className="relative bg-white p-40 py-0 rounded-l-full flex items-center justify-self-end">
          <Image
            src="/images/FIF.png"
            alt="Centralized Logo"
            width={100}
            height={100}
          />
        </div>
      </div>
    </nav>
  );
};

export default Header;
