"use client";
import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserNavbar } from "@/components/layout/user-navbar";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ChevronLeft, Zap, Lock, CheckCircle, Clock } from "lucide-react";
import { MATCH_STATUS_LABELS, MATCH_PHASE_LABELS } from "@/types";
import { formatDateTime } from "@/lib/utils";

interface MatchData {
  id: string;
  matchDate: string;
  status: string;
  phase: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam: { id: string; name: string; code: string };
  awayTeam: { id: string; name: string; code: string };
  round?: { id: string; name: string; phase: string } | null;
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
  items: PredictionItem[];
};

function groupByRound(items: PredictionItem[]): GroupedRound[] {
  const map = new Map<string, GroupedRound>();
  for (const item of items) {
    const roundId = item.match.round?.id ?? "no-round";
    const label = item.match.round?.name ?? MATCH_PHASE_LABELS[item.match.phase as keyof typeof MATCH_PHASE_LABELS] ?? item.match.phase;
    if (!map.has(roundId)) {
      map.set(roundId, { key: roundId, label, items: [] });
    }
    map.get(roundId)!.items.push(item);
  }
  return Array.from(map.values());
}

function isMatchLocked(matchDate: string, status: string) {
  return status !== "Scheduled" || new Date() >= new Date(matchDate);
}

export default function PredictionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: poolId } = use(params);
  const { data: session } = useSession();
  const [items, setItems] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingMatch, setSavingMatch] = useState<string | null>(null);
  const [doublePickLoading, setDoublePickLoading] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, { home: string; away: string }>>({});

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
      })
      .finally(() => setLoading(false));
  }, [poolId]);

  useEffect(() => { load(); }, [load]);

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <UserNavbar
        userName={session?.user?.name}
        userRole={session?.user?.role as "User" | "Admin" | undefined}
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Link
          href={`/dashboard/pools/${poolId}`}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao bolão
        </Link>

        <h1 className="text-2xl font-black text-slate-900 mb-1">Palpites</h1>
        <p className="text-sm text-slate-500 mb-5">
          Faça seus palpites e escolha uma partida por rodada para valer o dobro.
        </p>

        {items.length === 0 && (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
            <p className="text-slate-500">Nenhuma partida disponível no momento.</p>
          </div>
        )}

        {groups.map((group) => (
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
        ))}
      </main>
    </div>
  );
}

function MatchPredictionCard({
  item,
  inputs,
  savingMatch,
  doublePickLoading,
  onInputChange,
  onSave,
  onToggleDouble,
}: {
  item: PredictionItem;
  inputs: Record<string, { home: string; away: string }>;
  savingMatch: string | null;
  doublePickLoading: string | null;
  onInputChange: (matchId: string, side: "home" | "away", value: string) => void;
  onSave: (matchId: string) => void;
  onToggleDouble: (matchId: string) => void;
}) {
  const { match, prediction, isDouble } = item;
  const locked = isMatchLocked(match.matchDate, match.status);
  const val = inputs[match.id] ?? { home: "", away: "" };
  const hasRound = match.round != null;

  const statusColor: Record<string, string> = {
    Scheduled: "bg-blue-100 text-blue-600",
    Live: "bg-green-100 text-green-600",
    Finished: "bg-slate-100 text-slate-600",
    Canceled: "bg-red-100 text-red-600",
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isDouble ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-100"}`}>
      {isDouble && (
        <div className="bg-amber-500 text-white text-xs font-bold text-center py-1.5 flex items-center justify-center gap-1">
          <Zap className="h-3 w-3" />
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
          <div className="flex-1 text-center">
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

          <div className="flex-1 text-center">
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
                className="flex-1 h-14 text-center text-2xl font-black rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none bg-slate-50"
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
                className="flex-1 h-14 text-center text-2xl font-black rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none bg-slate-50"
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
                  title={isDouble ? "Remover dobro" : "Marcar como vale o dobro"}
                >
                  <Zap className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
