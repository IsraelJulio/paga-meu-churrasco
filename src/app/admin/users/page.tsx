"use client";
import { useEffect, useState } from "react";
import { Users, Search, KeyRound, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";

interface UserRow {
  id: string;
  name: string;
  login: string;
  role: string;
  createdAt: string;
  _count: { poolsOwned: number; poolParticipants: number };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function handleReset() {
    if (!resetId) return;
    setResetting(true);
    try {
      const res = await fetch(`/api/admin/users/${resetId}/reset-password`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Senha resetada para 654321");
      } else {
        toast.error("Erro ao resetar senha");
      }
    } finally {
      setResetting(false);
      setResetId(null);
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.login.toLowerCase().includes(search.toLowerCase())
  );

  const resetUser = users.find((u) => u.id === resetId);

  return (
    <div>
      <PageHeader
        title="Usuários"
        description={`${users.length} usuário${users.length !== 1 ? "s" : ""} cadastrado${users.length !== 1 ? "s" : ""}`}
      />

      {loading ? (
        <PageSpinner label="Carregando usuários..." />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum usuário cadastrado"
          description="Os usuários aparecerão aqui após se registrarem."
        />
      ) : (
        <>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome ou login..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-10 text-sm">
              Nenhum usuário encontrado para &quot;{search}&quot;
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((u) => (
                <div
                  key={u.id}
                  className="bg-white rounded-2xl px-5 py-4 border border-slate-100 shadow-sm flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-base shrink-0">
                    {u.name[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 truncate">
                        {u.name}
                      </p>
                      <Badge variant={u.role === "Admin" ? "warning" : "default"}>
                        {u.role === "Admin" ? (
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" /> Admin
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" /> Usuário
                          </span>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{u.login}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {u._count.poolParticipants} bolão{u._count.poolParticipants !== 1 ? "es" : ""} &middot; membro desde{" "}
                      {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setResetId(u.id)}
                  >
                    <KeyRound className="h-4 w-4" />
                    Resetar senha
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!resetId}
        onClose={() => setResetId(null)}
        onConfirm={handleReset}
        loading={resetting}
        title="Resetar senha?"
        description={
          resetUser
            ? `A senha de "${resetUser.name}" será alterada para 654321. O usuário deverá trocar após o login.`
            : "A senha será alterada para 654321."
        }
      />
    </div>
  );
}
