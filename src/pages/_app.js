import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import "@/styles/globals.css";

import Navbar from "@/components/Navbar";

import menuData from "@/menudata";

export default function App({ Component, pageProps }) {
  const [validUser, setValidUser] = useState(false);
  const router = useRouter();

  const checkPass = async (text) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);

   
    const guess = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (
      guess ==
      "a950c4ec34f2eff78dbae4166fb0d3d1319946931665b360ce94d0c63c683b6e"
    ) {
      setValidUser(true);
      console.log("Valid");
    }
     // REMOVE THIS LATER
    setValidUser(true);
    console.log("Valid");
  };



  if (!validUser) {
    return (
      <div className="w-full px-5">
        <h1> IF THIS IS MESSAGE IS HERE EMAIL John IMMEDIATELY</h1>
        <h1 className="mt-3 mb-2">Enter Password:</h1>
        <input
          type="password"
          onChange={(e) => {
            checkPass(e.target.value);
          }}
          className="w-full bg-gray-200 rounded-lg py-2 px-3"
        ></input>
      </div>
    );
  }

  if (router.pathname == "/" && validUser) {
    
    return (
      <>
        <Navbar />

        <div className="w-full flex justify-center mb-10 mt-5">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-light">Welcome to the Admin Panel</h1>
            <p className="text-xl font-light mt-2">
              Select a menu item to get started
            </p>
          </div>
        </div>

        <div className="w-full flex justify-around text-white font-semibold text-2xl">
          <Link href="/schedule">
            <button className="px-5 py-3 bg-blue-600 rounded-lg hover:bg-blue-500">
              Schedule Admin
            </button>
          </Link>
          <Link href="/courses">
            <button className="px-5 py-3 bg-blue-600 rounded-lg hover:bg-blue-500">
              Courses Admin
            </button>
          </Link>
        </div>
      </>
    );
  }

  if (validUser)
  console.log("hi"); 
  console.log(menuData[router.pathname.split("/")[1]]);
    return (
      <>
        <Navbar />

        <div className="flex mt-5 w-100vw">
          <div className="min-w-[20rem] w-[15%]">
            <div className="bg-slate-100 mx-5 rounded-lg px-3 py-3">
              <div className="flex items-center gap-x-3 mb-5">
                <Link href="/">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="h-5 text-blue-600 hover:text-blue-500 hover:cursor-pointer"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                    />
                  </svg>
                </Link>

                <h1 className="font-light text-lg">
                  {menuData[router.pathname.split("/")[1]].title}
                </h1>
              </div>
              {menuData[router.pathname.split("/")[1]].items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`rounded-lg px-3 py-5 mt-2 cursor-pointer ${
                      router.pathname != item.href && "hover:bg-slate-50"
                    } ${
                      router.pathname == item.href ? "bg-slate-200" : "bg-white"
                    }`}
                  >
                    <h1>{item.title}</h1>
                    <p className="text-xs mt-1">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <Component {...pageProps} />
        </div>
      </>
    );
}
