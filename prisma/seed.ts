import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Users
  const adminHash = await bcrypt.hash("admin123", 12);
  const userHash = await bcrypt.hash("user123", 12);
  const user2Hash = await bcrypt.hash("user456", 12);

  const admin = await prisma.user.upsert({
    where: { login: "admin" },
    update: {},
    create: { name: "Admin", login: "admin", passwordHash: adminHash, role: "Admin" },
  });

  const user = await prisma.user.upsert({
    where: { login: "user" },
    update: {},
    create: { name: "Usuário Teste", login: "user", passwordHash: userHash, role: "User" },
  });

  const user2 = await prisma.user.upsert({
    where: { login: "craque" },
    update: {},
    create: { name: "Craque do Palpite", login: "craque", passwordHash: user2Hash, role: "User" },
  });

  console.log(`✅ Usuários criados: ${admin.login}, ${user.login}, ${user2.login}`);

  // Groups
  const groupA = await prisma.group.upsert({ where: { id: "group-a" }, update: {}, create: { id: "group-a", name: "Grupo A", description: "Brasil, Noruega, Costa do Marfim, México" } });
  const groupB = await prisma.group.upsert({ where: { id: "group-b" }, update: {}, create: { id: "group-b", name: "Grupo B", description: "Argentina, Polônia, Arábia Saudita, Austrália" } });

  console.log(`✅ Grupos criados`);

  // Teams
  const teams = [
    { id: "team-bra", name: "Brasil", code: "BRA", group: "A", primaryColor: "#009c3b", secondaryColor: "#ffdf00" },
    { id: "team-arg", name: "Argentina", code: "ARG", group: "B", primaryColor: "#74acdf", secondaryColor: "#ffffff" },
    { id: "team-fra", name: "França", code: "FRA", group: "C", primaryColor: "#0055a4", secondaryColor: "#ef4135" },
    { id: "team-esp", name: "Espanha", code: "ESP", group: "D", primaryColor: "#c60b1e", secondaryColor: "#ffc400" },
    { id: "team-por", name: "Portugal", code: "POR", group: "H", primaryColor: "#006600", secondaryColor: "#ff0000" },
    { id: "team-ale", name: "Alemanha", code: "GER", group: "E", primaryColor: "#000000", secondaryColor: "#ffffff" },
  ];

  for (const team of teams) {
    await prisma.team.upsert({ where: { id: team.id }, update: {}, create: team });
  }

  console.log(`✅ ${teams.length} seleções criadas`);

  // Players
  const players = [
    { teamId: "team-bra", name: "Vinicius Jr.", number: 7, position: "Atacante", club: "Real Madrid" },
    { teamId: "team-bra", name: "Rodrygo", number: 10, position: "Atacante", club: "Real Madrid" },
    { teamId: "team-bra", name: "Casemiro", number: 5, position: "Volante", club: "Manchester United" },
    { teamId: "team-arg", name: "Lionel Messi", number: 10, position: "Atacante", club: "Inter Miami" },
    { teamId: "team-arg", name: "Lautaro Martínez", number: 22, position: "Atacante", club: "Inter de Milão" },
    { teamId: "team-fra", name: "Kylian Mbappé", number: 10, position: "Atacante", club: "Real Madrid" },
  ];

  for (const p of players) {
    const existing = await prisma.player.findFirst({ where: { teamId: p.teamId, name: p.name } });
    if (!existing) await prisma.player.create({ data: p });
  }

  console.log(`✅ ${players.length} jogadores criados`);

  // Stadiums
  const stadiums = [
    { id: "stadium-maracana", name: "Estádio do Maracanã", city: "Rio de Janeiro", country: "Brasil", capacity: 78838 },
    { id: "stadium-mineirao", name: "Mineirão", city: "Belo Horizonte", country: "Brasil", capacity: 61846 },
    { id: "stadium-morumbi", name: "MorumBIS", city: "São Paulo", country: "Brasil", capacity: 66795 },
  ];

  for (const s of stadiums) {
    await prisma.stadium.upsert({ where: { id: s.id }, update: {}, create: s });
  }

  console.log(`✅ ${stadiums.length} estádios criados`);

  // Rounds
  const rounds = [
    { id: "round-1", name: "Rodada 1 – Fase de Grupos", description: "Primeira rodada da fase de grupos", phase: "GroupStage", startDate: new Date("2026-06-14T00:00:00Z"), endDate: new Date("2026-06-17T23:59:59Z") },
    { id: "round-2", name: "Rodada 2 – Fase de Grupos", description: "Segunda rodada da fase de grupos", phase: "GroupStage", startDate: new Date("2026-06-18T00:00:00Z"), endDate: new Date("2026-06-22T23:59:59Z") },
  ];

  for (const r of rounds) {
    await prisma.round.upsert({ where: { id: r.id }, update: {}, create: r });
  }

  console.log(`✅ Rodadas criadas`);

  // Matches
  const existingMatches = await prisma.match.findMany({ where: { homeTeamId: { in: ["team-bra", "team-fra"] } } });

  let matchBraArg: { id: string } | null = null;
  let matchFraEsp: { id: string } | null = null;
  let matchBraPor: { id: string } | null = null;

  if (existingMatches.length === 0) {
    matchBraArg = await prisma.match.create({
      data: {
        homeTeamId: "team-bra", awayTeamId: "team-arg",
        groupId: "group-a", stadiumId: "stadium-maracana",
        roundId: "round-1",
        matchDate: new Date("2026-06-14T18:00:00Z"),
        status: "Finished", phase: "GroupStage",
        homeScore: 2, awayScore: 1,
      },
    });
    matchFraEsp = await prisma.match.create({
      data: {
        homeTeamId: "team-fra", awayTeamId: "team-esp",
        groupId: null, stadiumId: "stadium-mineirao",
        roundId: "round-1",
        matchDate: new Date("2026-06-15T21:00:00Z"),
        status: "Finished", phase: "GroupStage",
        homeScore: 1, awayScore: 1,
      },
    });
    matchBraPor = await prisma.match.create({
      data: {
        homeTeamId: "team-bra", awayTeamId: "team-por",
        groupId: "group-a", stadiumId: "stadium-morumbi",
        roundId: "round-2",
        matchDate: new Date("2026-06-20T20:00:00Z"),
        status: "Scheduled", phase: "GroupStage",
      },
    });
    await prisma.match.create({
      data: {
        homeTeamId: "team-arg", awayTeamId: "team-ale",
        groupId: "group-b", stadiumId: "stadium-maracana",
        roundId: "round-2",
        matchDate: new Date("2026-06-21T20:00:00Z"),
        status: "Scheduled", phase: "GroupStage",
      },
    });
  } else {
    matchBraArg = existingMatches.find((m) => m.homeTeamId === "team-bra") ?? null;
    matchFraEsp = existingMatches.find((m) => m.homeTeamId === "team-fra") ?? null;
  }

  console.log(`✅ Partidas criadas/encontradas`);

  // Badges
  const badges = [
    { id: "badge-first-correct", name: "Primeiro Acerto", description: "Acertou o primeiro resultado no bolão", icon: "⚽", category: "Iniciante", condition: "FIRST_CORRECT_RESULT", points: 10, isActive: true },
    { id: "badge-first-exact", name: "Na Mosca", description: "Acertou o primeiro placar exato", icon: "🎯", category: "Precisão", condition: "FIRST_EXACT_SCORE", points: 30, isActive: true },
    { id: "badge-five-exact", name: "Atirador de Elite", description: "Acertou 5 placares exatos", icon: "🏹", category: "Precisão", condition: "FIVE_EXACT_SCORES", points: 100, isActive: true },
    { id: "badge-ten-exact", name: "Sniper", description: "Acertou 10 placares exatos", icon: "🔭", category: "Precisão", condition: "TEN_EXACT_SCORES", points: 250, isActive: true },
    { id: "badge-streak-5", name: "Em Chamas", description: "Acertou resultado em 5 jogos seguidos", icon: "🔥", category: "Sequência", condition: "FIVE_CORRECT_RESULTS_STREAK", points: 50, isActive: true },
    { id: "badge-streak-10", name: "Imparável", description: "Acertou resultado em 10 jogos seguidos", icon: "⚡", category: "Sequência", condition: "TEN_CORRECT_RESULTS_STREAK", points: 150, isActive: true },
    { id: "badge-double-hit", name: "Corajoso", description: "Acertou uma partida escolhida para valer o dobro", icon: "💪", category: "Ousadia", condition: "FIRST_DOUBLE_PICK_HIT", points: 40, isActive: true },
    { id: "badge-three-doubles", name: "All In", description: "Acertou 3 partidas valendo o dobro", icon: "🃏", category: "Ousadia", condition: "THREE_DOUBLE_PICK_HITS", points: 120, isActive: true },
    { id: "badge-round-winner", name: "Rei da Rodada", description: "Terminou uma rodada em primeiro lugar", icon: "👑", category: "Liderança", condition: "ROUND_WINNER", points: 80, isActive: true },
    { id: "badge-first-leader", name: "Líder", description: "Assumiu a liderança do bolão pela primeira vez", icon: "🏆", category: "Liderança", condition: "FIRST_TIME_LEADER", points: 60, isActive: true },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({ where: { id: b.id }, update: {}, create: b });
  }

  console.log(`✅ ${badges.length} conquistas criadas`);

  // Example pool
  const existingPool = await prisma.pool.findFirst({ where: { name: "Bolão dos Brothers" } });
  let pool: { id: string } | null = existingPool;

  if (!existingPool) {
    pool = await prisma.pool.create({
      data: {
        name: "Bolão dos Brothers",
        description: "O bolão oficial da galera. Perdedor paga o churrasco! 🥩",
        inviteCode: "BROTHER",
        ownerId: user.id,
        scoringSettings: { create: {} },
        participants: {
          create: [
            { userId: user.id, role: "Owner" },
            { userId: user2.id, role: "Member" },
          ],
        },
      },
    });

    console.log(`✅ Bolão de exemplo criado: ${pool.id}`);

    // Predictions for finished matches
    if (matchBraArg && pool) {
      // user: guessed 2x1 (exact!) — actual 2x1
      await prisma.prediction.create({
        data: {
          poolId: pool.id,
          userId: user.id,
          matchId: matchBraArg.id,
          predictedHomeScore: 2,
          predictedAwayScore: 1,
        },
      });
      // user2: guessed 1x0 (correct winner, different score)
      await prisma.prediction.create({
        data: {
          poolId: pool.id,
          userId: user2.id,
          matchId: matchBraArg.id,
          predictedHomeScore: 1,
          predictedAwayScore: 0,
        },
      });
    }

    if (matchFraEsp && pool) {
      // user: guessed 0x0 (correct — draw, same diff=0, same total=2)
      await prisma.prediction.create({
        data: {
          poolId: pool.id,
          userId: user.id,
          matchId: matchFraEsp.id,
          predictedHomeScore: 0,
          predictedAwayScore: 0,
        },
      });
      // user2: guessed 2x1 (wrong — predicted home win, was draw)
      await prisma.prediction.create({
        data: {
          poolId: pool.id,
          userId: user2.id,
          matchId: matchFraEsp.id,
          predictedHomeScore: 2,
          predictedAwayScore: 1,
        },
      });
    }

    console.log(`✅ Palpites de exemplo criados`);
  }

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📋 Credenciais de acesso:");
  console.log("   Admin:  admin@pagameuchurrasco.com / admin123");
  console.log("   User:   user@pagameuchurrasco.com / user123");
  console.log("   User2:  craque@pagameuchurrasco.com / user456");
  console.log("\n💡 Para calcular pontuações do bolão de exemplo:");
  console.log("   Acesse /admin/pools e clique em 'Recalcular Pontuação'");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
