"use client";
import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserNavbar } from "@/components/layout/user-navbar";
import { PageSpinner, Spinner } from "@/components/ui/spinner";
import { Dialog } from "@/components/ui/dialog";
import {
  ChevronLeft,
  Crown,
  Flame,
  Target,
  Trophy,
  Star,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { TeamFlag } from "@/components/ui/team-flag";

interface RankingEntry {
  position: number;
  isMe: boolean;
  userId: string;
  role: string;
  totalPoints: number;
  exactScores: number;
  correctResults: number;
  currentStreak: number;
  bestStreak: number;
  badgesCount: number;
  user: { id: string; name: string };
  recentBadges: { id: string; icon?: string; name: string }[];
}

interface UserStats {
  participant: {
    userId: string;
    role: string;
    totalPoints: number;
    exactScores: number;
    correctResults: number;
    currentStreak: number;
    bestStreak: number;
    badgesCount: number;
    position: number;
    user: { id: string; name: string };
  };
  predictions: {
    id: string;
    predictedHomeScore: number;
    predictedAwayScore: number;
    match: {
      homeTeam: { name: string; code: string; flagUrl?: string | null; primaryColor?: string | null };
      awayTeam: { name: string; code: string; flagUrl?: string | null; primaryColor?: string | null };
      homeScore: number | null;
      awayScore: number | null;
      matchDate: string;
    };
    score: {
      totalPoints: number;
      exactScorePoints: number;
      resultPoints: number;
      goalDifferencePoints: number;
      totalGoalsPoints: number;
    } | null;
  }[];
  badges: { id: string; name: string; icon?: string; description?: string }[];
}

function predictionKind(
  prediction: UserStats["predictions"][number]
): "exact" | "correct" | "wrong" | "unscored" {
  if (!prediction.score) return "unscored";
  if (prediction.score.exactScorePoints > 0) return "exact";
  if (prediction.score.resultPoints > 0 || prediction.score.goalDifferencePoints > 0) return "correct";
  return "wrong";
}

function UserStatsModal({
  open,
  onClose,
  stats,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  stats: UserStats | null;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={stats?.participant.user.name ?? "Estatísticas"}>
      {loading || !stats ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Overview */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/15 border border-orange-500/25 rounded-full flex items-center justify-center font-bold text-orange-400 text-xl shrink-0">
              {stats.participant.user.name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-100 text-lg">
                  {stats.participant.user.name}
                </span>
                {stats.participant.role === "Owner" && (
                  <Crown className="h-4 w-4 text-amber-400" />
                )}
              </div>
              <span className="text-sm text-slate-400">{stats.participant.position}º lugar</span>
            </div>
            <div className="ml-auto text-right">
              <div className="font-black text-2xl text-orange-400 font-display" style={{ textShadow: "0 0 12px rgba(249,115,22,0.4)" }}>
                {stats.participant.totalPoints}
              </div>
              <div className="text-xs text-slate-500">pontos</div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-500/8 border border-green-500/20 rounded-xl p-3 text-center">
              <div className="font-black text-green-400 text-xl font-display">{stats.participant.exactScores}</div>
              <div className="text-xs text-green-500 font-medium mt-0.5">Exatos</div>
            </div>
            <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-3 text-center">
              <div className="font-black text-blue-400 text-xl font-display">{stats.participant.correctResults}</div>
              <div className="text-xs text-blue-500 font-medium mt-0.5">Resultados</div>
            </div>
            <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 text-center">
              <div className="font-black text-amber-400 text-xl font-display">{stats.participant.badgesCount}</div>
              <div className="text-xs text-amber-500 font-medium mt-0.5">Badges</div>
            </div>
          </div>

          {/* Streaks */}
          {(stats.participant.currentStreak > 0 || stats.participant.bestStreak > 0) && (
            <div className="flex gap-2">
              {stats.participant.currentStreak > 1 && (
                <div className="flex items-center gap-1.5 bg-orange-500/8 border border-orange-500/20 rounded-xl px-3 py-2 flex-1">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <div>
                    <div className="font-bold text-orange-400 text-sm">{stats.participant.currentStreak} seguidos</div>
                    <div className="text-xs text-slate-500">Sequência atual</div>
                  </div>
                </div>
              )}
              {stats.participant.bestStreak > 0 && (
                <div className="flex items-center gap-1.5 bg-purple-500/8 border border-purple-500/20 rounded-xl px-3 py-2 flex-1">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <div>
                    <div className="font-bold text-purple-400 text-sm">{stats.participant.bestStreak} seguidos</div>
                    <div className="text-xs text-slate-500">Melhor sequência</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Badges */}
          {stats.badges.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Star className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-bold text-slate-300">Badges conquistados</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.badges.map((badge) => (
                  <div
                    key={badge.id}
                    title={badge.description ?? badge.name}
                    className="flex items-center gap-1.5 bg-amber-500/8 border border-amber-500/20 rounded-full px-3 py-1"
                  >
                    <span className="text-base">{badge.icon ?? "🏅"}</span>
                    <span className="text-xs font-medium text-amber-400">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Predictions history */}
          {stats.predictions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-bold text-slate-300">Palpites recentes</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {stats.predictions.map((pred) => {
                  const kind = predictionKind(pred);
                  const rowBg =
                    kind === "exact"
                      ? "bg-green-500/8 border-green-500/20"
                      : kind === "correct"
                      ? "bg-blue-500/8 border-blue-500/20"
                      : kind === "wrong"
                      ? "bg-red-500/8 border-red-500/20"
                      : "bg-white/4 border-white/8";

                  return (
                    <div
                      key={pred.id}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${rowBg}`}
                    >
                      <div className="shrink-0">
                        {kind === "exact" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : kind === "correct" ? (
                          <CheckCircle2 className="h-4 w-4 text-blue-400" />
                        ) : kind === "wrong" ? (
                          <XCircle className="h-4 w-4 text-red-400" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-300">
                          <TeamFlag flagUrl={pred.match.homeTeam.flagUrl} code={pred.match.homeTeam.code} primaryColor={pred.match.homeTeam.primaryColor} size="xs" />
                          <span>{pred.match.homeScore ?? "?"} – {pred.match.awayScore ?? "?"}</span>
                          <TeamFlag flagUrl={pred.match.awayTeam.flagUrl} code={pred.match.awayTeam.code} primaryColor={pred.match.awayTeam.primaryColor} size="xs" />
                        </div>
                        <div className="text-xs text-slate-500">
                          Palpite: {pred.predictedHomeScore} – {pred.predictedAwayScore}
                        </div>
                      </div>

                      {pred.score && (
                        <div className="shrink-0 text-right">
                          <span className={`font-black text-sm font-display ${
                            kind === "exact" ? "text-green-400" : kind === "correct" ? "text-blue-400" : "text-red-400"
                          }`}>
                            +{pred.score.totalPoints}
                          </span>
                          <div className="text-xs text-slate-500">pts</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {stats.predictions.length === 0 && (
            <div className="text-center py-4 text-sm text-slate-500">
              Nenhum palpite registrado ainda.
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}

export default function RankingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: poolId } = use(params);
  const { data: session } = useSession();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/pools/${poolId}/ranking`)
      .then((r) => r.json())
      .then(setRanking)
      .finally(() => setLoading(false));
  }, [poolId]);

  useEffect(() => { load(); }, [load]);

  const openUserStats = useCallback(
    (userId: string) => {
      setSelectedUserId(userId);
      setUserStats(null);
      setStatsLoading(true);
      fetch(`/api/pools/${poolId}/participants/${userId}/stats`)
        .then((r) => r.json())
        .then(setUserStats)
        .finally(() => setStatsLoading(false));
    },
    [poolId]
  );

  const closeUserStats = useCallback(() => {
    setSelectedUserId(null);
    setUserStats(null);
  }, []);

  const me = ranking.find((r) => r.isMe);

  if (loading) return <PageSpinner label="Carregando ranking..." />;

  const positionStyle = (pos: number) => {
    if (pos === 1) return "text-amber-400";
    if (pos === 2) return "text-slate-400";
    if (pos === 3) return "text-amber-700";
    return "text-slate-500";
  };

  return (
    <div className="min-h-screen bg-[#060611] flex flex-col">
      <UserNavbar
        userName={session?.user?.name}
        userRole={session?.user?.role as "User" | "Admin" | undefined}
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Link
          href={`/dashboard/pools/${poolId}`}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao bolão
        </Link>

        <div className="flex items-center gap-3 mb-5 animate-slide-up">
          <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/25 rounded-xl flex items-center justify-center">
            <Trophy className="h-5 w-5 text-amber-400" style={{ filter: "drop-shadow(0 0 6px rgba(245,158,11,0.6))" }} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100 font-display tracking-wide">Ranking</h1>
            <p className="text-sm text-slate-500">{ranking.length} participante{ranking.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* My position banner */}
        {me && (
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-4 mb-4 text-white shadow-[0_0_25px_rgba(249,115,22,0.35)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium mb-0.5">Minha posição</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black font-display">{me.position}º</span>
                  <span className="text-xl font-bold text-orange-200">—</span>
                  <span className="text-xl font-bold font-display">{me.totalPoints} pts</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-orange-100 text-xs">Placares exatos</div>
                <div className="font-black text-xl font-display">{me.exactScores}</div>
              </div>
            </div>
          </div>
        )}

        {ranking.length === 0 ? (
          <div className="bg-[#0d0d1e] rounded-2xl p-8 border border-orange-500/15 text-center">
            <p className="text-slate-400">Nenhum participante ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {ranking.map((entry, i) => (
              <button
                key={entry.userId}
                onClick={() => openUserStats(entry.userId)}
                className={`w-full text-left bg-[#0d0d1e] rounded-2xl p-4 border transition-all hover:scale-[1.01] active:scale-[0.99] animate-slide-up ${
                  entry.isMe
                    ? "border-orange-400/40 shadow-[0_0_18px_rgba(249,115,22,0.12)]"
                    : "border-orange-500/12 hover:border-orange-500/30 hover:shadow-[0_0_14px_rgba(249,115,22,0.08)]"
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  {/* Position */}
                  <div className={`text-xl font-black w-8 text-center shrink-0 font-display ${positionStyle(entry.position)}`}>
                    {entry.position === 1 ? (
                      <Crown
                        className="h-6 w-6 text-amber-400 mx-auto"
                        style={{ filter: "drop-shadow(0 0 8px rgba(245,158,11,0.7))" }}
                      />
                    ) : (
                      entry.position
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center font-bold text-orange-400 shrink-0">
                    {entry.user.name[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-100 truncate">
                        {entry.user.name}
                      </span>
                      {entry.isMe && (
                        <span className="shrink-0 bg-orange-500/15 border border-orange-500/25 text-orange-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
                          Você
                        </span>
                      )}
                      {entry.role === "Owner" && (
                        <Crown className="shrink-0 h-3.5 w-3.5 text-amber-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Target className="h-3 w-3" />
                        {entry.exactScores} exatos
                      </span>
                      {entry.currentStreak > 1 && (
                        <span className="flex items-center gap-1 text-xs text-orange-400 font-semibold">
                          <Flame className="h-3 w-3" />
                          {entry.currentStreak} seguidos
                        </span>
                      )}
                    </div>
                    {entry.recentBadges.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {entry.recentBadges.map((b) => (
                          <span key={b.id} title={b.name} className="text-sm">
                            {b.icon ?? "🏅"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Points */}
                  <div className="text-right shrink-0">
                    <div className="font-black text-xl text-white font-display" style={entry.position <= 3 ? { textShadow: "0 0 10px rgba(249,115,22,0.35)" } : undefined}>
                      {entry.totalPoints}
                    </div>
                    <div className="text-xs text-slate-500">pts</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <UserStatsModal
        open={selectedUserId !== null}
        onClose={closeUserStats}
        stats={userStats}
        loading={statsLoading}
      />
    </div>
  );
}
