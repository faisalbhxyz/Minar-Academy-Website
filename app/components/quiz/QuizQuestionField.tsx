"use client";

type AnswerValue = string | boolean | string[] | undefined;

interface Props {
  question: QuizQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  questionNumber: number;
}

export default function QuizQuestionField({
  question,
  value,
  onChange,
  questionNumber,
}: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          <span className="text-blue-600 mr-2">Q{questionNumber}.</span>
          {question.title}
        </h3>
        <span className="shrink-0 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {question.marks} mark{question.marks === 1 ? "" : "s"}
        </span>
      </div>

      {question.details && (
        <p className="text-sm text-gray-600 mb-4">{question.details}</p>
      )}

      {renderInput(question.type, question, value, onChange)}
    </div>
  );
}

function renderInput(
  type: QuizQuestionType,
  question: QuizQuestion,
  value: AnswerValue,
  onChange: (value: AnswerValue) => void
) {
  switch (type) {
    case "single_choice":
      return (
        <div className="space-y-2">
          {(question.options ?? []).map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                value === option.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={value === option.id}
                onChange={() => onChange(option.id)}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-800">{option.text}</span>
            </label>
          ))}
        </div>
      );

    case "multiple_choice": {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          {(question.options ?? []).map((option) => {
            const checked = selected.includes(option.id);
            return (
              <label
                key={option.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  checked
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    if (checked) {
                      onChange(selected.filter((id) => id !== option.id));
                    } else {
                      onChange([...selected, option.id]);
                    }
                  }}
                  className="text-blue-600 rounded"
                />
                <span className="text-sm text-gray-800">{option.text}</span>
              </label>
            );
          })}
        </div>
      );
    }

    case "true_false":
      return (
        <div className="flex gap-3">
          {[true, false].map((option) => (
            <label
              key={String(option)}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition ${
                value === option
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                checked={value === option}
                onChange={() => onChange(option)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-800">
                {option ? "True" : "False"}
              </span>
            </label>
          ))}
        </div>
      );

    default:
      return (
        <p className="text-sm text-gray-500">
          Unsupported question type: {type}
        </p>
      );
  }
}
