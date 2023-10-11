import { HeaderMenu } from "./HeaderMenu";

export function Header() {
  return (
    <div className="flex pt-2">
      <div className="w-full">
        <div className="font-sans text-xl">YT subscriptions</div>
      </div>
      <div className="flex justify-end">
        <HeaderMenu />
      </div>
    </div>
  );
}
