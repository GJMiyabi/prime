"use client";
import React, { useState, FormEvent } from "react";

const PersonForm: React.FC = () => {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {};

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white shadow rounded w-full max-w-md mx-auto"
    >
      <div className="flex flex-col">
        <label className="mb-2 font-semibold text-gray-700">氏名:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-2 font-semibold text-gray-700">Email:</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        送信
      </button>
    </form>
  );
};

export default PersonForm;
