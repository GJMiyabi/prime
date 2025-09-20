import { Header } from "./_components/common/header";
import PersonCreateForm from "./_components/person/form/create";

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
