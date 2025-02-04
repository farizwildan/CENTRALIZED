import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../app/components/header";  // Pastikan nama dan path benar
import ToDoList from "./ToDoList";
import Dashboard from "../app/components/dashboard";
import Achievement from "./Achievement";
import "@/styles/globals.css";

export default function Home() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Mengecek status login di sessionStorage
        const loginStatus = sessionStorage.getItem("isLoggedIn");

        // Jika belum login, arahkan ke halaman login
        if (!loginStatus) {
            router.push("/login");
        } else {
            setIsLoggedIn(true);
        }
    }, [router]);

    if (!isLoggedIn) {
        return null; // Halaman kosong sementara menunggu pengecekan login
    }

    return (
        <main className="flex min-h-screen flex-col bg-primary">
            <Header />
            <div className="container mt-24 mx-auto px-12 py-4">
                <Dashboard />
                <ToDoList
                    sheetID="1y35T2Jq50E5DViOZ2V5YjsKVIO-fECa9GU_2KXZTJGA"
                    apiKey="AIzaSyB25avskYJrDJ4b-nkuQNp93LsiPhcSMB4"
                    id="ToDoList"
                />
                <Achievement
                    sheetID="1y35T2Jq50E5DViOZ2V5YjsKVIO-fECa9GU_2KXZTJGA"
                    apiKey="AIzaSyB25avskYJrDJ4b-nkuQNp93LsiPhcSMB4"
                    id="Achievement"
                />
            </div>
        </main>
    );
}
