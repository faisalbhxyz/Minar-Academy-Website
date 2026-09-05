import { Session } from "next-auth";

function greetingName(session: Session): string {
  const user = session.user as Session["user"] & {
    first_name?: string;
    last_name?: string | null;
  };
  if (user?.name?.trim()) return user.name.trim();
  const full = [user?.first_name, user?.last_name]
    .filter((part): part is string => Boolean(part && String(part).trim()))
    .join(" ")
    .trim();
  return full || user?.email || "Student";
}

export default async function UserGreeting({ session }: { session: Session }) {
  const name = greetingName(session);
  const initial = name.charAt(0).toUpperCase() || "S";

  return (
    <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-xl font-bold text-blue-600">{initial}</span>
        </div>
        <p className="text-lg font-semibold">
          Hello, <span className="text-gray-700">{name}</span>
        </p>
      </div>
    </div>
  );
}
