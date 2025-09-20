"use client";
import { Header } from "../_components/common/header";
import { useParams } from "next/navigation";
import { useGetPerson } from "../_hooks/person/get";

export default function PersonDetailPage() {
  const params = useParams<{ personId: string }>();
  const personId = params?.personId;

  const { data, loading, error, refetch } = useGetPerson(personId);

  console.log("GraphQL errors:", data);

  return (
    <div>
      <Header />
      <div className="pt-[30px]"></div>
    </div>
  );
}
