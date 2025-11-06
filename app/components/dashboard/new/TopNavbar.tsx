export default function TopNavbar() {
  return (
    <nav className="w-full bg-white shadow px-6 py-4 flex justify-between items-center border-b">
      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold text-blue-600">Logo</div>
      </div>
      <ul className="flex space-x-6 text-gray-700">
        <li>Home</li>
        <li>Courses</li>
        <li>Digital Products</li>
        <li>Registration</li>
        <li>Login</li>
      </ul>
    </nav>
  );
}