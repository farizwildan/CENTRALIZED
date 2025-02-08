import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../app/components/header";
import ToDoList from "./ToDoList";
import Dashboard from "../app/components/dashboard";
import Achievement from "./Achievement";
import "@/styles/globals.css";

export default function Home() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const sheetID = process.env.sheetID;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    useEffect(() => {
        const loginStatus = sessionStorage.getItem("isLoggedIn");

        if (!loginStatus) {
            router.push("/login");
        } else {
            setIsLoggedIn(true);
        }
    }, [router]);

    if (!isLoggedIn) {
        return null;
    }

    return (
        <main className="flex min-h-screen flex-col bg-primary">
            <Header />
            <div className="container mt-24 mx-auto px-12 py-4">
                <Dashboard />
                <ToDoList
                    sheetID={sheetID}
                    apiKey={apiKey}
                    id="ToDoList"
                />
                <Achievement
                    sheetID={sheetID}
                    apiKey={apiKey}
                    id="Achievement"
                />
            </div>
        </main>
    );
}
