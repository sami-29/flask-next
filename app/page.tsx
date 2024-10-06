"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

interface Audiobook {
  id: number;
  title: string;
  author: string;
  cover_image: string;
  votes: number;
  total_votes: number;
  user_vote: number;
}

const HomePage = () => {
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<string | null>(null);
  const [voting, setVoting] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAudiobooks();
    fetchUser();
  }, []);

  const fetchAudiobooks = async () => {
    try {
      const response = await fetch("/api/audiobooks");
      const data: Audiobook[] = await response.json();
      setAudiobooks(data);
    } catch (error) {
      console.error("Failed to fetch audiobooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user", {
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

  const handleVote = async (audiobookId: number, value: number) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const currentVote = audiobooks.find(
      (book) => book.id === audiobookId
    )?.user_vote;

    const newVote = currentVote === value ? 0 : value;

    setVoting(audiobookId);
    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audiobook_id: audiobookId, value: newVote }),
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setAudiobooks((prevAudiobooks) =>
          prevAudiobooks.map((book) =>
            book.id === audiobookId
              ? { ...book, votes: data.votes, user_vote: newVote }
              : book
          )
        );
      }
    } catch (error) {
      console.error("Failed to vote:", error);
    } finally {
      setVoting(null);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        Loading...
      </div>
    );
  }

  return (
    <div className='container p-4 mx-auto'>
      <h1 className='mb-8 text-4xl font-bold text-center'>Audiobook Voting</h1>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {audiobooks.map((book) => {
          return (
            <div key={book.id} className='p-4 bg-white rounded-lg shadow-md'>
              <img
                src={`https://picsum.photos/seed/${book.id}/200/300`}
                alt={book.title}
                className='object-cover w-full h-48 rounded'
              />
              <h2 className='mt-4 text-xl font-semibold'>{book.title}</h2>
              <p className='text-gray-600'>{book.author}</p>
              <div className='flex items-center justify-between mt-4'>
                <div className='flex space-x-2'>
                  <button
                    onClick={() => handleVote(book.id, 1)}
                    disabled={voting === book.id}
                    className={`px-2 py-1 rounded ${
                      book.user_vote === 1
                        ? "bg-gray-400"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white transition duration-200`}>
                    <FaArrowUp />
                  </button>
                  <button
                    onClick={() => handleVote(book.id, -1)}
                    disabled={voting === book.id}
                    className={`px-2 py-1 rounded ${
                      book.user_vote === -1
                        ? "bg-gray-400"
                        : "bg-red-500 hover:bg-red-600"
                    } text-white transition duration-200`}>
                    <FaArrowDown />
                  </button>
                </div>
                <span className='font-medium text-gray-800'>
                  Score: {book.votes}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;
