"use client";
import { Header } from "../_components/common/header";
import { useParams } from "next/navigation";
import { useGetPerson } from "../_hooks/person/get";
import CollapsibleCard from "../_components/common/card/header";

export default function PersonDetailPage() {
  const params = useParams<{ personId: string }>();
  const personId = params?.personId;

  const { data, loading, error, refetch } = useGetPerson(personId, {
    contacts: true,
  });

  console.log("GraphQL errors:", error, data);

  return (
    <div>
      <Header />
      <div className="pt-[30px] px-[15px]">
        <div className="pt-[5px]">
          <CollapsibleCard title="プロフィール" value={data?.person?.name} />
        </div>
        <div className="pt-[15px]">
          <CollapsibleCard title="連絡先" value="" />
        </div>
      </div>
    </div>
  );
}
