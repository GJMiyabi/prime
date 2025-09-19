import { Header } from "./_components/Header";
import PersonForm from "./_components/PersonForm";

export default function Home() {
  return (
    <div>
      <Header />
      <div className="pt-[30px]">
        <PersonForm />
      </div>
    </div>
  );
}
