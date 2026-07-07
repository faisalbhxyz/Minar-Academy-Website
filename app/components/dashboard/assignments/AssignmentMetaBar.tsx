import AssignmentDeadlineCountdown from "@/app/components/dashboard/assignments/AssignmentDeadlineCountdown";

interface Props {
  duration: string;
  deadlineSeconds: number | null;
  totalMarks: number;
  passingMark: number;
}

export default function AssignmentMetaBar({
  duration,
  deadlineSeconds,
  totalMarks,
  passingMark,
}: Props) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-gray-200 pb-5 text-sm text-gray-700">
      <p>
        <span className="font-medium text-gray-900">Duration:</span> {duration}
      </p>
      {deadlineSeconds != null && (
        <p>
          <span className="font-medium text-gray-900">Deadline:</span>{" "}
          <AssignmentDeadlineCountdown initialSeconds={deadlineSeconds} />
        </p>
      )}
      <p>
        <span className="font-medium text-gray-900">Total Marks:</span>{" "}
        {totalMarks}
      </p>
      <p>
        <span className="font-medium text-gray-900">Passing Mark:</span>{" "}
        {passingMark}
      </p>
    </div>
  );
}
