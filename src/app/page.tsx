import RouteList from "./components/routes/RouteList";

import IconButtonWithNotification from "./components/general/IconButtonWithNotification";
// import ButtonWithNotification from "./components/ButtonWithNotificaion";

import { LuFileQuestion } from "react-icons/lu";


export default function Home() {
  return (
    <div className="h-screen w-auto bg-slate-600  flex flex-row justify-center items-center">
      <main className="h-auto w-full">
        <div className={`w-full flex flex-row justify-center bg-white`}>
          <div className="w-11/12">
            <RouteList />

          </div>

        </div>
      </main>
    </div>
  );
}
