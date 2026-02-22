"use client";

import { Header } from "@/app/_components/common";
import {
  CollapsibleCardContainer,
  CardContent,
} from "@/app/_components/common";
import { LABEL_ORGANIZATION, LABEL_NAME } from "../_constants";

export default function Page() {
  return (
    <div>
      <Header />
      <div className="pt-[30px]">
        <CollapsibleCardContainer title={LABEL_ORGANIZATION}>
          <div className="py-[5px]">
            <CardContent title={LABEL_NAME} value="" />
          </div>
        </CollapsibleCardContainer>
      </div>
    </div>
  );
}
