import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Users
  const adminHash = await bcrypt.hash("admin123", 12);
  const userHash = await bcrypt.hash("user123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@pagameuchurrasco.com" },
    update: {},
    create: { name: "Admin", email: "admin@pagameuchurrasco.com", passwordHash: adminHash, role: "Admin" },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@pagameuchurrasco.com" },
    update: {},
    create: { name: "Usuário Teste", email: "user@pagameuchurrasco.com", passwordHash: userHash, role: "User" },
  });

  console.log(`✅ Usuários criados: ${admin.email}, ${user.email}`);

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

  // Matches
  const matchDate1 = new Date("2026-06-14T18:00:00Z");
  const matchDate2 = new Date("2026-06-15T21:00:00Z");

  const existingMatch = await prisma.match.findFirst({ where: { homeTeamId: "team-bra", awayTeamId: "team-arg" } });
  if (!existingMatch) {
    await prisma.match.create({
      data: { homeTeamId: "team-bra", awayTeamId: "team-arg", groupId: null, stadiumId: "stadium-maracana", matchDate: matchDate1, status: "Scheduled", phase: "GroupStage" },
    });
    await prisma.match.create({
      data: { homeTeamId: "team-fra", awayTeamId: "team-esp", groupId: null, stadiumId: "stadium-mineirao", matchDate: matchDate2, status: "Scheduled", phase: "GroupStage" },
    });
  }

  console.log(`✅ Partidas criadas`);

  // Badges
  const badges = [
    { id: "badge-craque", name: "Craque dos Palpites", description: "Acerte 5 placares exatos", icon: "🎯", category: "Precisão", points: 100, isActive: true },
    { id: "badge-sequencia", name: "Sequência Imbatível", description: "Acerte 3 resultados seguidos", icon: "🔥", category: "Sequência", points: 50, isActive: true },
    { id: "badge-primeiro", name: "Primeiro Palpite", description: "Faça seu primeiro palpite", icon: "⚽", category: "Conquista", points: 10, isActive: true },
    { id: "badge-adivinho", name: "O Adivinho", description: "Acerte o placar exato de uma semifinal", icon: "🔮", category: "Especial", points: 200, isActive: true },
    { id: "badge-churrasco", name: "Mestre do Churrasco", description: "Ganhe um bolão completo", icon: "🥩", category: "Conquista", points: 500, isActive: true },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({ where: { id: b.id }, update: {}, create: b });
  }

  console.log(`✅ ${badges.length} conquistas criadas`);
  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📋 Credenciais de acesso:");
  console.log("   Admin: admin@pagameuchurrasco.com / admin123");
  console.log("   User:  user@pagameuchurrasco.com / user123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
