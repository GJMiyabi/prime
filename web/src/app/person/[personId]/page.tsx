"use client";
import { Header } from "../../_components/common/header";
import { useParams } from "next/navigation";
import { useGetPerson } from "../_hook/person/get";
import {
  CollapsibleCardContainer,
  CardContent,
} from "../../_components/common";

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
          <CollapsibleCardContainer title="アカウント設定">
            {data?.person?.principal ? (
              <div className="py-[5px]">
                <CardContent
                  title="設定施設"
                  value={data?.person?.principal.account?.username}
                />
              </div>
            ) : (
              <p className="pl-[15px] py-[5px]">アカウントの設定はありません</p>
            )}
          </CollapsibleCardContainer>
        </div>

        <div className="pt-[15px]">
          <CollapsibleCardContainer title="所属先施設">
            {data?.person?.facilities?.length ? (
              data.person.facilities.map((facility) => (
                <div className="py-[5px]" key={facility.id}>
                  <CardContent title="設定施設" value={facility.name} />
                </div>
              ))
            ) : (
              <p className="pl-[15px] py-[5px]">所属施設の設定ありません</p>
            )}
          </CollapsibleCardContainer>
        </div>

        <div className="pt-[15px]">
          <CollapsibleCardContainer title="所属元組織">
            {data?.person?.organization ? (
              <div className="py-[5px]">
                <CardContent
                  title="設定施設"
                  value={data?.person?.organization.name}
                />
              </div>
            ) : (
              <p className="pl-[15px] py-[5px]">所属組織の設定ありません</p>
            )}
          </CollapsibleCardContainer>
        </div>
      </div>
    </div>
  );
}
