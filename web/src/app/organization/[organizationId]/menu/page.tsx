import { Header } from "@/app/_components/common";
import { CollapsibleCardContainer } from "@/app/_components/common";

export default function Page() {
  return (
    <div>
      <Header />
      <div className="pt-[30px]">
        <CollapsibleCardContainer title="組織"></CollapsibleCardContainer>
      </div>
    </div>
  );
}
