"use client";

import { Header } from "@/app/_components/common";
import {
  CollapsibleCardContainer,
  CardContent,
} from "@/app/_components/common";

export default function Page() {
  return (
    <div>
      <Header />
      <div className="pt-[30px]">
        <CollapsibleCardContainer title="組織">
          <div className="py-[5px]">
            <CardContent title="名称" value="" />
          </div>
        </CollapsibleCardContainer>
      </div>
    </div>
  );
}
