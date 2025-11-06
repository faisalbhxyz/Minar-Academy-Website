import { Session } from "next-auth";

export default async function UserGreeting({ session }: { session: Session }) {
  return (
    <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-xl font-bold text-blue-600">{session.user.name.charAt(0)}</span>
        </div>
        <p className="text-lg font-semibold">
          Hello, <span className="text-gray-700">{session.user.name}</span>
        </p>
      </div>
      {/* <p className="text-sm text-yellow-600 font-medium">
        Your Application is pending as of{" "}
        <span className="font-semibold">20 June, 2025</span>
      </p> */}
    </div>
  );
}
