import Image from "next/image";
import AccountabilityTypeSummarizeProcess from "./components/AccountabilityTypeSummarizeProcess";
// import ButtonWithNotification from "./components/ButtonWithNotificaion";
export default function Home() {
  return (
    <div className="h-screen w-auto bg-slate-600  flex flex-row justify-center items-center">
      <main className="h-auto w-auto">
        <div className={`w-96`}>
          <AccountabilityTypeSummarizeProcess 
            titleOfSummarize={("This is a list")}
            contentOfSummariaze={[
              {
                message: "Total value of product devolution:",
                value: "$35",
                isUnderline: false,
                isBold: false,
                isItalic: false,
                isSeparateLine: false
              },
              {
                message: "Solution product devolution:",
                value: "$37.5",
                isUnderline: false,
                isBold: false,
                isItalic: false,
                isSeparateLine: false
              },
              {
                message: "Balance product devolution:",
                value: "$180",
                isUnderline: true,
                isBold: true,
                isItalic: true,
                isSeparateLine: true
              },
            ]}/>
        </div>
      </main>
    </div>
  );
}
