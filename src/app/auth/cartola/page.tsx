"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flame } from "lucide-react";
import Link from "next/link";

function CartolaAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError(true);
      return;
    }

    signIn("cartola-sso", { token, redirect: false }).then((result) => {
      if (result?.ok) {
        router.replace("/dashboard");
      } else {
        setError(true);
      }
    });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#060611] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Flame className="h-10 w-10 text-orange-400 mx-auto" />
          <p className="text-slate-300">Link inválido ou expirado.</p>
          <Link
            href="/login"
            className="inline-block text-sm text-orange-400 hover:text-orange-300 underline"
          >
            Fazer login manualmente
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060611] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Flame
          className="h-10 w-10 text-orange-400 mx-auto animate-pulse"
          style={{ filter: "drop-shadow(0 0 8px rgba(249,115,22,0.7))" }}
        />
        <p className="text-slate-300">Entrando via Cartola...</p>
      </div>
    </div>
  );
}

function CartolaAuthLoading() {
  return (
    <div className="min-h-screen bg-[#060611] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Flame
          className="h-10 w-10 text-orange-400 mx-auto animate-pulse"
          style={{ filter: "drop-shadow(0 0 8px rgba(249,115,22,0.7))" }}
        />
        <p className="text-slate-300">Entrando via Cartola...</p>
      </div>
    </div>
  );
}

export default function CartolaAuthPage() {
  return (
    <Suspense fallback={<CartolaAuthLoading />}>
      <CartolaAuthContent />
    </Suspense>
  );
}
