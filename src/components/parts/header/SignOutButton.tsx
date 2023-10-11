import { ArrowDownRightIcon } from "@heroicons/react/20/solid";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 hover:bg-blue-500 hover:text-white"
      onClick={() => signOut()}
    >
      <ArrowDownRightIcon className="mr-2 h-5 w-5" aria-hidden="true" />
      Sign Out
    </button>
  );
}
