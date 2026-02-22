import { Header } from "@/app/_components/common";
import { CollapsibleCardContainer } from "@/app/_components/common";
import { LABEL_ORGANIZATION } from "../../_constants";

export default function Page() {
  return (
    <div>
      <Header />
      <div className="pt-[30px]">
        <CollapsibleCardContainer title={LABEL_ORGANIZATION}></CollapsibleCardContainer>
      </div>
    </div>
  );
}
