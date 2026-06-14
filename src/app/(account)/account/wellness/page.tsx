import Link from "next/link";
import { ArrowLeft, Target, Plus, Flame } from "lucide-react";
import { requireCustomerUser } from "@/lib/auth/customer-server";

export const dynamic = "force-dynamic";

// Mock wellness goals
const mockGoals = [
  { id: "1", name: "Daily vitamins", progress: 5, target: 7, unit: "days", category: "Supplements" },
  { id: "2", name: "Water intake", progress: 6, target: 8, unit: "glasses", category: "Hydration" },
  { id: "3", name: "Exercise", progress: 3, target: 5, unit: "sessions", category: "Fitness" },
  { id: "4", name: "Sleep 8 hours", progress: 4, target: 7, unit: "nights", category: "Rest" }
];

export default async function WellnessGoalsPage() {
  await requireCustomerUser();

  const streak = 7;
  const completedThisWeek = mockGoals.filter((g) => g.progress >= g.target).length;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/account/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Wellness Goals</h1>
            <p className="text-sm text-slate-500">Track your health and wellness progress</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          Add goal
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
              <Target className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{mockGoals.length}</p>
              <p className="text-xs text-slate-500">Active goals</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <Target className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{completedThisWeek}</p>
              <p className="text-xs text-slate-500">Completed this week</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{streak}</p>
              <p className="text-xs text-slate-500">Day streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Your goals</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {mockGoals.map((goal) => {
            const percentage = Math.min((goal.progress / goal.target) * 100, 100);
            const isComplete = percentage >= 100;
            return (
              <div key={goal.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{goal.name}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {goal.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {goal.progress} of {goal.target} {goal.unit}
                    </p>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isComplete ? "bg-emerald-500" : "bg-brand-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isComplete ? "text-emerald-600" : "text-slate-900"}`}>
                      {percentage.toFixed(0)}%
                    </p>
                    {isComplete && (
                      <span className="text-xs text-emerald-600">Complete!</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
        <p className="text-sm text-brand-800">
          <strong>Tip:</strong> Setting consistent wellness goals can improve your health outcomes by up to 40%.
          Keep tracking your progress daily!
        </p>
      </div>
    </div>
  );
}
