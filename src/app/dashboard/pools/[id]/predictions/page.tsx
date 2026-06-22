"use client";
import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserNavbar } from "@/components/layout/user-navbar";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/ui/spinner";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ChevronLeft, Crown, Lock, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { MATCH_STATUS_LABELS, MATCH_PHASE_LABELS } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { TeamFlag } from "@/components/ui/team-flag";

interface MatchData {
  id: string;
  matchDate: string;
  status: string;
  phase: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam: { id: string; name: string; code: string; flagUrl?: string | null; primaryColor?: string | null };
  awayTeam: { id: string; name: string; code: string; flagUrl?: string | null; primaryColor?: string | null };
  round?: { id: string; name: string; phase: string; startDate?: string | null; createdAt?: string } | null;
}

interface PredictionData {
  id: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  isLocked: boolean;
  score?: {
    totalPoints: number;
    explanation: string;
    exactScorePoints: number;
    resultPoints: number;
  } | null;
}

interface PredictionItem {
  match: MatchData;
  prediction: PredictionData | null;
  isDouble: boolean;
  doublePickRoundId: string | null;
}

type GroupedRound = {
  key: string;
  label: string;
  sortDate: string;
  items: PredictionItem[];
};

function groupByRound(items: PredictionItem[]): GroupedRound[] {
  const map = new Map<string, GroupedRound>();
  for (const item of items) {
    const roundId = item.match.round?.id ?? "no-round";
    const label =
      item.match.round?.name ??
      MATCH_PHASE_LABELS[item.match.phase as keyof typeof MATCH_PHASE_LABELS] ??
      item.match.phase;
    const sortDate =
      item.match.round?.startDate ?? item.match.round?.createdAt ?? "";
    if (!map.has(roundId)) {
      map.set(roundId, { key: roundId, label, sortDate, items: [] });
    }
    map.get(roundId)!.items.push(item);
  }
  return Array.from(map.values());
}

function getCurrentRoundKey(groups: GroupedRound[]): string | null {
  const roundGroups = groups.filter((g) => g.key !== "no-round");
  if (roundGroups.length === 0) return null;
  return [...roundGroups].sort((a, b) =>
    b.sortDate.localeCompare(a.sortDate)
  )[0].key;
}

function isMatchLocked(matchDate: string, status: string) {
  return status !== "Scheduled" || new Date() >= new Date(matchDate);
}

function hasUnsavedPredictions(
  items: PredictionItem[],
  inputs: Record<string, { home: string; away: string }>,
  savedInputs: Record<string, { home: string; away: string }>
): boolean {
  return items.some((item) => {
    if (isMatchLocked(item.match.matchDate, item.match.status)) return false;
    const current = inputs[item.match.id];
    if (!current || (current.home === "" && current.away === "")) return false;
    const saved = savedInputs[item.match.id] ?? { home: "", away: "" };
    return current.home !== saved.home || current.away !== saved.away;
  });
}

function hasMissingDoublePick(items: PredictionItem[]): boolean {
  const groups = groupByRound(items);
  return groups.some((group) => {
    if (group.key === "no-round") return false;
    const hasUnlocked = group.items.some(
      (item) => !isMatchLocked(item.match.matchDate, item.match.status)
    );
    const hasDouble = group.items.some((item) => item.isDouble);
    return hasUnlocked && !hasDouble;
  });
}

export default function PredictionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: poolId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingMatch, setSavingMatch] = useState<string | null>(null);
  const [doublePickLoading, setDoublePickLoading] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, { home: string; away: string }>>({});
  const [savedInputs, setSavedInputs] = useState<Record<string, { home: string; away: string }>>({});
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [activeTab, setActiveTab] = useState<"current" | "previous">("current");

  const load = useCallback(() => {
    fetch(`/api/pools/${poolId}/predictions`)
      .then((r) => r.json())
      .then((data: PredictionItem[]) => {
        setItems(data);
        const init: Record<string, { home: string; away: string }> = {};
        for (const item of data) {
          init[item.match.id] = {
            home: item.prediction?.predictedHomeScore?.toString() ?? "",
            away: item.prediction?.predictedAwayScore?.toString() ?? "",
          };
        }
        setInputs(init);
        setSavedInputs(init);
      })
      .finally(() => setLoading(false));
  }, [poolId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (hasUnsavedPredictions(items, inputs, savedInputs) || hasMissingDoublePick(items)) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [items, inputs, savedInputs]);

  function handleBack() {
    if (hasUnsavedPredictions(items, inputs, savedInputs)) {
      setShowUnsavedWarning(true);
    } else if (hasMissingDoublePick(items)) {
      setShowLeaveWarning(true);
    } else {
      router.push(`/dashboard/pools/${poolId}`);
    }
  }

  async function savePrediction(matchId: string) {
    const val = inputs[matchId];
    if (val?.home === "" || val?.away === "") {
      toast.error("Preencha os dois placares");
      return;
    }
    setSavingMatch(matchId);
    try {
      const res = await fetch(`/api/pools/${poolId}/predictions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          predictedHomeScore: Number(val.home),
          predictedAwayScore: Number(val.away),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Palpite salvo!");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar palpite");
    } finally {
      setSavingMatch(null);
    }
  }

  async function toggleDouble(matchId: string) {
    setDoublePickLoading(matchId);
    try {
      const res = await fetch(`/api/pools/${poolId}/double-pick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.removed) {
        toast.success("Partida dobrada removida");
      } else {
        toast.success("Partida marcada como vale o dobro!");
      }
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setDoublePickLoading(null);
    }
  }

  if (loading) return <PageSpinner label="Carregando palpites..." />;

  const groups = groupByRound(items);
  const currentRoundKey = getCurrentRoundKey(groups);
  const currentGroups = groups.filter(
    (g) => g.key === currentRoundKey || g.key === "no-round"
  );
  const previousGroups = groups
    .filter((g) => g.key !== currentRoundKey && g.key !== "no-round")
    .sort((a, b) => a.sortDate.localeCompare(b.sortDate));
  const showTabs = previousGroups.length > 0;

  function renderGroups(groupList: GroupedRound[], readonly = false) {
    return groupList.map((group) => (
      <div key={group.key} className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
            {group.label}
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="flex flex-col gap-3">
          {group.items.map((item) => (
            <MatchPredictionCard
              key={item.match.id}
              item={item}
              inputs={inputs}
              savingMatch={savingMatch}
              doublePickLoading={doublePickLoading}
              readonly={readonly}
              onInputChange={(matchId, side, value) =>
                setInputs((prev) => ({
                  ...prev,
                  [matchId]: { ...prev[matchId], [side]: value },
                }))
              }
              onSave={savePrediction}
              onToggleDouble={toggleDouble}
            />
          ))}
        </div>
      </div>
    ));
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <UserNavbar
        userName={session?.user?.name}
        userRole={session?.user?.role as "User" | "Admin" | undefined}
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao bolão
        </button>

        <h1 className="text-2xl font-black text-slate-900 mb-1">Palpites</h1>
        <p className="text-sm text-slate-500 mb-5">
          Faça seus palpites e escolha uma partida por rodada para valer o dobro.
        </p>

        {showTabs && (
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5">
            <button
              onClick={() => setActiveTab("current")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === "current"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Rodada Atual
            </button>
            <button
              onClick={() => setActiveTab("previous")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === "previous"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Rodadas Anteriores
            </button>
          </div>
        )}

        {items.length === 0 && (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
            <p className="text-slate-500">Nenhuma partida disponível no momento.</p>
          </div>
        )}

        {(!showTabs || activeTab === "current") && renderGroups(currentGroups)}

        {showTabs && activeTab === "previous" && renderGroups(previousGroups, true)}
      </main>

      <Dialog
        open={showUnsavedWarning}
        onClose={() => setShowUnsavedWarning(false)}
        title="Palpites não salvos!"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <p className="text-slate-600">
            Você preencheu palpites que ainda não foram salvos. Se sair agora, vai perder tudo!
          </p>
          <div className="flex gap-3 w-full mt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowUnsavedWarning(false)}>
              Ficar e salvar
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => router.push(`/dashboard/pools/${poolId}`)}>
              Sair mesmo assim
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={showLeaveWarning}
        onClose={() => setShowLeaveWarning(false)}
        title="Você esqueceu da coroa!"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
            <Crown className="h-7 w-7 text-amber-500" />
          </div>
          <p className="text-slate-600">
            Você ainda não escolheu uma partida para valer o dobro em todas as rodadas. Não se esqueça de marcar sua favorita com a coroa!
          </p>
          <div className="flex gap-3 w-full mt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowLeaveWarning(false)}>
              Ficar e escolher
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => router.push(`/dashboard/pools/${poolId}`)}>
              Sair mesmo assim
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function MatchPredictionCard({
  item,
  inputs,
  savingMatch,
  doublePickLoading,
  readonly,
  onInputChange,
  onSave,
  onToggleDouble,
}: {
  item: PredictionItem;
  inputs: Record<string, { home: string; away: string }>;
  savingMatch: string | null;
  doublePickLoading: string | null;
  readonly?: boolean;
  onInputChange: (matchId: string, side: "home" | "away", value: string) => void;
  onSave: (matchId: string) => void;
  onToggleDouble: (matchId: string) => void;
}) {
  const { match, prediction, isDouble } = item;
  const locked = readonly || isMatchLocked(match.matchDate, match.status);
  const val = inputs[match.id] ?? { home: "", away: "" };
  const hasRound = match.round != null;

  const statusColor: Record<string, string> = {
    Scheduled: "bg-blue-100 text-blue-600",
    Live: "bg-green-100 text-green-600",
    Finished: "bg-slate-100 text-slate-600",
    Canceled: "bg-red-100 text-red-600",
  };

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-shadow ${isDouble ? "border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.4),0_4px_24px_rgba(245,158,11,0.3)]" : "border-slate-100 shadow-sm"}`}>
      {isDouble && (
        <div className="bg-amber-500 text-white text-xs font-bold text-center py-1.5 flex items-center justify-center gap-1">
          <Crown className="h-3 w-3" />
          Vale o dobro!
        </div>
      )}
      <div className="p-4">
        {/* Match header */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[match.status] ?? "bg-slate-100 text-slate-600"}`}>
            {MATCH_STATUS_LABELS[match.status as keyof typeof MATCH_STATUS_LABELS] ?? match.status}
          </span>
          <span className="text-xs text-slate-400">{formatDateTime(match.matchDate)}</span>
        </div>

        {/* Teams + score */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 text-center flex flex-col items-center gap-1">
            <TeamFlag flagUrl={match.homeTeam.flagUrl} code={match.homeTeam.code} primaryColor={match.homeTeam.primaryColor} size="md" />
            <div className="font-black text-xl text-slate-900">{match.homeTeam.code}</div>
            <div className="text-xs text-slate-500">{match.homeTeam.name}</div>
          </div>

          {match.status === "Finished" ? (
            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl font-black text-xl shrink-0">
              {match.homeScore} – {match.awayScore}
            </div>
          ) : (
            <div className="text-slate-400 font-bold text-sm shrink-0">vs</div>
          )}

          <div className="flex-1 text-center flex flex-col items-center gap-1">
            <TeamFlag flagUrl={match.awayTeam.flagUrl} code={match.awayTeam.code} primaryColor={match.awayTeam.primaryColor} size="md" />
            <div className="font-black text-xl text-slate-900">{match.awayTeam.code}</div>
            <div className="text-xs text-slate-500">{match.awayTeam.name}</div>
          </div>
        </div>

        {/* Prediction inputs or result */}
        {locked ? (
          <div>
            {prediction ? (
              <div className={`rounded-xl p-3 text-center ${match.status === "Finished" && prediction.score ? "bg-green-50 border border-green-100" : "bg-slate-50"}`}>
                <div className="flex items-center justify-center gap-3 mb-1">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-black text-lg text-slate-900">
                    {prediction.predictedHomeScore} – {prediction.predictedAwayScore}
                  </span>
                </div>
                {prediction.score && (
                  <>
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      <span className="font-black text-green-700">
                        +{prediction.score.totalPoints} pts
                      </span>
                      {isDouble && prediction.score.totalPoints > 0 && (
                        <span className="text-amber-600 text-xs font-bold">(×2)</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{prediction.score.explanation}</p>
                  </>
                )}
                {!prediction.score && match.status === "Finished" && (
                  <p className="text-xs text-slate-400">Calculando...</p>
                )}
                {match.status !== "Finished" && (
                  <p className="text-xs text-slate-400">Palpite bloqueado</p>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-3 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                Sem palpite para esta partida
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={99}
                inputMode="numeric"
                pattern="[0-9]*"
                value={val.home}
                onChange={(e) => onInputChange(match.id, "home", e.target.value)}
                placeholder="0"
                className="flex-1 h-14 text-center text-2xl font-black text-slate-900 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none bg-slate-50"
              />
              <span className="font-black text-slate-400 text-xl">–</span>
              <input
                type="number"
                min={0}
                max={99}
                inputMode="numeric"
                pattern="[0-9]*"
                value={val.away}
                onChange={(e) => onInputChange(match.id, "away", e.target.value)}
                placeholder="0"
                className="flex-1 h-14 text-center text-2xl font-black text-slate-900 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none bg-slate-50"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                loading={savingMatch === match.id}
                onClick={() => onSave(match.id)}
                disabled={val.home === "" || val.away === ""}
              >
                {prediction ? "Atualizar" : "Salvar palpite"}
              </Button>
              {hasRound && (
                <button
                  onClick={() => onToggleDouble(match.id)}
                  disabled={doublePickLoading === match.id}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors border ${
                    isDouble
                      ? "bg-amber-500 border-amber-500 text-white"
                      : "border-amber-300 text-amber-600 hover:bg-amber-50"
                  }`}
                  title={isDouble ? "Remover coroa" : "Marcar como vale o dobro"}
                >
                  <Crown className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
