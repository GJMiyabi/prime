"use client";
import { Header } from "../_components/common/header";
import { useParams } from "next/navigation";
import { useGetPerson } from "../_hooks/person/get";
import { CollapsibleCardContainer, CardContent } from "../_components/common";

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
          <CollapsibleCardContainer title="プロフィール">
            <div className="py-[5px]">
              <CardContent title="名称" value={data?.person?.name} />
            </div>
          </CollapsibleCardContainer>
        </div>
        <div className="pt-[15px]">
          <CollapsibleCardContainer title="連絡先">
            {data?.person?.contacts?.map((contact) => (
              <div className="py-[5px]" key={contact.id}>
                <CardContent title={contact.type} value={contact.value} />
              </div>
            ))}
          </CollapsibleCardContainer>
        </div>

        <div className="pt-[15px]">
          <CollapsibleCardContainer title="所属先">
            {data?.person?.facilities?.length ? (
              data.person.facilities.map((facility) => (
                <div className="py-[5px]" key={facility.id}>
                  <CardContent title="設定施設" value={facility.name} />
                </div>
              ))
            ) : (
              <p className="pl-[15px] py-[5px]">所属の設定ありません</p>
            )}
          </CollapsibleCardContainer>
        </div>
      </div>
    </div>
  );
}
