import { StaffMember } from "../types/staff";

type StaffCardProps = {
  staff: StaffMember;
};

export default function StaffCard({
  staff,
}: StaffCardProps) {
  return (
    <div className="bg-zinc-900 border border-yellow-500 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-yellow-400">
        {staff.name}
      </h2>

      <p className="mt-3 text-gray-300">
        الوظيفة: {staff.role}
      </p>

      <div
        className={`mt-5 inline-block px-4 py-2 rounded-full font-bold ${
          staff.active
            ? "bg-green-600"
            : "bg-red-600"
        }`}
      >
        {staff.active ? "متصل" : "غير متصل"}
      </div>
    </div>
  );
}