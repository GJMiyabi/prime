"use client";
import React, { useState } from "react";
import { useCreateSinglePerson } from "@/app/_hooks/PersonFrom";

const PersonForm: React.FC = () => {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  // Add type annotation for data
  const { createPerson, loading, error } = useCreateSinglePerson();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await createPerson(name, value);
    if (error) {
      console.error(error);
      return;
    }
    if (data?.createSinglePerson) {
      const created = data?.createSinglePerson;
      console.log("Created:", created.id, created.name, created.value);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-white shadow rounded w-full max-w-md mx-auto"
    >
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-gray-700">Name</label>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1 font-semibold text-gray-700">Value</label>
        <input
          type="text"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        disabled={loading}
      >
        {loading ? "Saving..." : "Submit"}
      </button>

      {error && <p className="text-red-600 text-sm">Error: {error.message}</p>}
    </form>
  );
};

export default PersonForm;
