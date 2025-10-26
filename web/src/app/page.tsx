"use client";

import { Header } from "./_components/common/header";
import PersonCreateForm from "./person/_components/person/form/create";
import ProtectedRoute from "./_components/auth/protected-route";

export default function Home() {
  return (
    <ProtectedRoute>
      <div>
        <Header />
        <div className="pt-[30px]">
          <PersonCreateForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
