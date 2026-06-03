import Link from "next/link";
import { Target, Flame, ArrowRight } from "lucide-react";

interface WellnessGoal {
  id: string;
  name: string;
  progress: number;
  target: number;
  unit: string;
}

interface WellnessGoalsCardProps {
  goals: WellnessGoal[];
  streak?: number;
}

export function WellnessGoalsCard({ goals, streak = 0 }: WellnessGoalsCardProps) {
  const activeGoals = goals.slice(0, 3);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100">
            <Target className="h-4 w-4 text-brand-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Your wellness goals</h3>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1">
            <Flame className="h-3.5 w-3.5 text-orange-600" />
            <span className="text-xs font-semibold text-orange-700">{streak} day streak</span>
          </div>
        )}
      </div>

      {activeGoals.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <Target className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No active goals yet</p>
          <Link
            href="/account/wellness"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
          >
            Set your first goal
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activeGoals.map((goal) => {
            const percentage = Math.min((goal.progress / goal.target) * 100, 100);
            return (
              <div key={goal.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">{goal.name}</p>
                  <p className="text-xs text-slate-500">
                    {goal.progress}/{goal.target} {goal.unit}
                  </p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 100 ? "bg-emerald-500" : "bg-brand-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-[10px] text-slate-400">
                  {percentage.toFixed(0)}% complete
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/account/wellness"
        className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-brand-600 hover:underline"
      >
        Manage goals
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
