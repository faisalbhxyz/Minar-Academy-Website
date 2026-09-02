import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getStudentOrders } from "@/app/actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

function formatPrice(amount: number): string {
  return `৳${amount.toLocaleString("bn-BD")}`;
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("bn-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function statusLabel(order: StudentOrder): string {
  return order.payment_status ?? order.status ?? "pending";
}

export default async function OrdersPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const orders = await getStudentOrders(session);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          ড্যাশবোর্ডে ফিরুন
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">অর্ডার ইতিহাস</h1>
        <p className="text-gray-600 mt-1">আপনার সব কোর্স কেনাকাটার রেকর্ড।</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="font-medium text-gray-800">কোনো অর্ডার নেই</p>
          <Link
            href="/courses/all"
            className="inline-block mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            কোর্স ব্রাউজ করুন
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">কোর্স</th>
                  <th className="text-left px-4 py-3 font-medium">ইনভয়েস</th>
                  <th className="text-left px-4 py-3 font-medium">মোট</th>
                  <th className="text-left px-4 py-3 font-medium">পেমেন্ট</th>
                  <th className="text-left px-4 py-3 font-medium">স্ট্যাটাস</th>
                  <th className="text-left px-4 py-3 font-medium">তারিখ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {order.course_title}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {order.invoice_id ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {order.payment_method ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 capitalize">
                        {statusLabel(order)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatWhen(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
