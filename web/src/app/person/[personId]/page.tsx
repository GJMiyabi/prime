"use client";
import { Header } from "../../_components/common/header";
import { useParams } from "next/navigation";
import { usePersonGet } from "../../_hooks/person/usePersonGet";
import {
  CollapsibleCardContainer,
  CardContent,
} from "../../_components/common";
import * as CONSTANTS from "../_constants";

export default function PersonDetailPage() {
  const params = useParams<{ personId: string }>();
  const personId = params?.personId;

  const { data, isLoading, error } = usePersonGet(personId, {
    contacts: true,
    principal: { account: true },
    facilities: true,
    organization: true,
  });

  if (isLoading) {
    return (
      <div>
        <Header />
        <div className="pt-[30px] px-[15px]">
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="pt-[30px] px-[15px]">
          <p className="text-red-600">エラー: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="pt-[30px] px-[15px]">
        <div className="pt-[5px]">
          <CollapsibleCardContainer title={CONSTANTS.LABEL_PROFILE}>
            <div className="py-[5px]">
              <CardContent title={CONSTANTS.LABEL_NAME} value={data?.name} />
            </div>
          </CollapsibleCardContainer>
        </div>
        <div className="pt-[15px]">
          <CollapsibleCardContainer title={CONSTANTS.LABEL_CONTACT}>
            {data?.contacts?.map((contact) => (
              <div className="py-[5px]" key={contact.id}>
                <CardContent title={contact.type} value={contact.value} />
              </div>
            ))}
          </CollapsibleCardContainer>
        </div>

        <div className="pt-[15px]">
          <CollapsibleCardContainer title={CONSTANTS.LABEL_ACCOUNT_SETTINGS}>
            {data?.principal ? (
              <div className="py-[5px]">
                <CardContent
                  title={CONSTANTS.LABEL_FACILITY}
                  value={data?.principal.account?.username}
                />
              </div>
            ) : (
              <p className="pl-[15px] py-[5px]">{CONSTANTS.MESSAGE_NO_ACCOUNT}</p>
            )}
          </CollapsibleCardContainer>
        </div>

        <div className="pt-[15px]">
          <CollapsibleCardContainer title={CONSTANTS.LABEL_AFFILIATED_FACILITIES}>
            {data?.facilities?.length ? (
              data.facilities.map((facility) => (
                <div className="py-[5px]" key={facility.id}>
                  <CardContent title={CONSTANTS.LABEL_FACILITY} value={facility.name} />
                </div>
              ))
            ) : (
              <p className="pl-[15px] py-[5px]">{CONSTANTS.MESSAGE_NO_FACILITY}</p>
            )}
          </CollapsibleCardContainer>
        </div>

        <div className="pt-[15px]">
          <CollapsibleCardContainer title={CONSTANTS.LABEL_PARENT_ORGANIZATION}>
            {data?.organization ? (
              <div className="py-[5px]">
                <CardContent
                  title={CONSTANTS.LABEL_FACILITY}
                  value={data?.organization.name}
                />
              </div>
            ) : (
              <p className="pl-[15px] py-[5px]">{CONSTANTS.MESSAGE_NO_ORGANIZATION}</p>
            )}
          </CollapsibleCardContainer>
        </div>
      </div>
    </div>
  );
}
