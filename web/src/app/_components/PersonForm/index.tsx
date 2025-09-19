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
    await createPerson(name, value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4">
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border p-2 rounded"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Saving..." : "Submit"}
      </button>

      {error && <p className="text-red-500">Error: {error.message}</p>}
    </form>
  );
};

export default PersonForm;
