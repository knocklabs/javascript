"use client";

import { FormEvent, useState } from "react";

import { fetchUserId } from "../actions/fetch-user-id";

export default function FetchUserIdForm() {
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUserData(null);
    setError(null);

    try {
      const result = await fetchUserId(email);
      setUserData(result);
    } catch (err) {
      setError("Failed to fetch user data. Please try again.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="p-2 border rounded-sm mr-2"
          required
        />
        <button
          type="submit"
          className="bg-[#E95744] text-white p-2 rounded-md hover:bg-[#E64733]"
        >
          Fetch User ID
        </button>
      </form>
      {userData && (
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">User Data:</h3>
          <pre className="whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>
      )}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
