"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "../supabase";

export function useBalance(userId: string | undefined) {
  const [balance, setBalance] = useState<number | null>(null);

  const loadBalance = useCallback(async () => {
    if (!userId) return;
    const sb = createClient();
    const { data } = await sb.from("profiles").select("balance").eq("id", userId).single();
    setBalance((data as { balance: number } | null)?.balance ?? 1000);
  }, [userId]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  const topUp = useCallback(
    async (amount: number = 500) => {
      if (!userId) return;
      const newBal = (balance ?? 0) + amount;
      setBalance(newBal);
      const sb = createClient();
      await sb.from("profiles").update({ balance: newBal }).eq("id", userId);
    },
    [userId, balance]
  );

  return { balance, setBalance, loadBalance, topUp };
}
