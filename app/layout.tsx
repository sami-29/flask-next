"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("api/user", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.username);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user session:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("api/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setDropdownOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <html lang='en'>
      <body className='bg-gray-100'>
        <nav className='bg-white shadow'>
          <div className='px-4 mx-auto max-w-7xl'>
            <div className='flex items-center justify-between py-4'>
              <div className='flex space-x-4'>
                <a href='/' className='text-xl font-bold text-gray-700'>
                  Audiobook App
                </a>
              </div>
              <div className='relative' ref={dropdownRef}>
                {user ? (
                  <div
                    className='flex items-center cursor-pointer'
                    onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <FaUserCircle className='text-2xl text-gray-700' />
                    <span className='ml-2 text-gray-700'>{user}</span>
                  </div>
                ) : (
                  <a
                    href='/login'
                    className='text-gray-700 hover:text-gray-900'>
                    Login
                  </a>
                )}
                {dropdownOpen && (
                  <div className='absolute right-0 w-48 mt-2 bg-white border rounded shadow-md'>
                    <button
                      onClick={handleLogout}
                      className='block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100'>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main className='p-4'>{children}</main>
      </body>
    </html>
  );
}
