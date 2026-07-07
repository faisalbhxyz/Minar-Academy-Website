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
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">
        {questionNumber}. {question.title}
      </h3>

      {question.details && (
        <p className="text-sm text-gray-600">{question.details}</p>
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
        <div className="space-y-3">
          {(question.options ?? []).map((option) => {
            const selected = value === option.id;
            return (
              <label
                key={option.id}
                className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition ${
                  selected
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={selected}
                  onChange={() => onChange(option.id)}
                  className="h-4 w-4 text-blue-600 shrink-0"
                />
                <span className="text-sm text-gray-800">{option.text}</span>
              </label>
            );
          })}
        </div>
      );

    case "multiple_choice": {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-3">
          {(question.options ?? []).map((option) => {
            const checked = selected.includes(option.id);
            return (
              <label
                key={option.id}
                className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition ${
                  checked
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-200 bg-white hover:border-gray-300"
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
                  className="h-4 w-4 text-blue-600 rounded shrink-0"
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
        <div className="space-y-3">
          {[true, false].map((option) => {
            const selected = value === option;
            return (
              <label
                key={String(option)}
                className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition ${
                  selected
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={selected}
                  onChange={() => onChange(option)}
                  className="h-4 w-4 text-blue-600 shrink-0"
                />
                <span className="text-sm font-medium text-gray-800">
                  {option ? "True" : "False"}
                </span>
              </label>
            );
          })}
        </div>
      );

    default:
      return (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This question type ({type}) is not supported. Please contact your
          instructor.
        </p>
      );
  }
}
