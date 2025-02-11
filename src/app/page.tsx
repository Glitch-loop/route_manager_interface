import Image from "next/image";
import AccountabilityTypeSummarizeProcess from "./components/AccountabilityTypeSummarizeProcess";
// import ButtonWithNotification from "./components/ButtonWithNotificaion";
export default function Home() {
  return (
    <div className="h-screen w-auto bg-slate-600  flex flex-row justify-center items-center">
      <main className="h-auto w-auto">
        <AccountabilityTypeSummarizeProcess />
      </main>
    </div>
  );
}
