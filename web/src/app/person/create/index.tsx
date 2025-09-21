import { Header } from "@/app/_components/common";
import PersonCreateForm from "@/app/person/_components/person/form/create";

export default function Home() {
  return (
    <div>
      <Header />
      <div className="pt-[30px]">
        <PersonCreateForm />
      </div>
    </div>
  );
}
