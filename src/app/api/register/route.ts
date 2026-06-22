import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, login, password } = await req.json();

    if (!name || !login || !password) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha precisa ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { login } });
    if (existing) {
      return NextResponse.json(
        { error: "Este login já está em uso" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, login, passwordHash, role: "User" },
    });

    return NextResponse.json(
      { id: user.id, name: user.name, login: user.login },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
