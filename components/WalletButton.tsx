"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";

export function WalletButton() {
const { connected, publicKey, disconnect } = useWallet();
const { setVisible } = useWalletModal();

if (connected && publicKey) {
const address = publicKey.toString();
const short = `${address.slice(0, 4)}...${address.slice(-4)}`;

return (
<div className="flex items-center gap-2">
<div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg border border-zinc-700">
<div className="w-2 h-2 rounded-full bg-green-400" />
<span className="text-sm text-zinc-200 font-mono">{short}</span>
</div>
<Button
variant="ghost"
size="icon"
onClick={disconnect}
className="text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
>
<LogOut className="w-4 h-4" />
</Button>
</div>
);
}

return (
<Button
onClick={() => setVisible(true)}
className="bg-[#4693ff] hover:bg-[#3a7de0] text-black font-semibold text-sm"
>
<Wallet className="w-4 h-4 mr-2" />
Connect Wallet
</Button>
);
}
