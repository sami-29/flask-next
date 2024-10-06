"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        router.push("/");
      } else {
        setError("Invalid username or password");
      }
    } catch (error) {
      console.error("Failed to log in:", error);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 bg-white rounded shadow-md'>
        <h1 className='mb-6 text-2xl font-bold text-center'>Login</h1>
        <form onSubmit={handleLogin}>
          <div className='mb-4'>
            <label className='block text-gray-700'>Username</label>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className='w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300'
            />
          </div>
          <div className='mb-6'>
            <label className='block text-gray-700'>Password</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300'
            />
          </div>
          {error && <p className='mb-4 text-red-500'>{error}</p>}
          <button
            type='submit'
            className='w-full py-2 text-white transition duration-200 bg-blue-500 rounded hover:bg-blue-600'>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
