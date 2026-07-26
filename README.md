# ✦ Stellar Grove: Knights of the Astral Rift ✦

> An interactive web3 game combining magical companion care taking, real-time Phaser 3 action combat, custom Star DNA breeding, and Soroban smart contract provenance on the **Stellar Testnet**.

![Stellar Grove Architecture](https://raw.githubusercontent.com/premxpagar/Stellardemoapp/main/public/favicon.svg)

---

## ✨ Features

- 🌌 **Grove Companion Sanctuary**: Care for, feed, rest, and level up magical star companions with individual personalities, mood cycles, and energy meters.
- ⚔️ **Knight Mode (Phaser 3 Engine)**: Enter the Astral Gate into real-time 2D action combat. Defeat enemies, collect stardust, dodge cosmic hazards, and challenge bosses.
- 🧬 **Star DNA & Starweave Fusion**: Deterministic genetic system for companions. Fuse two companions to breed new offspring inheriting traits, elements, and rare cosmic mutations.
- 📜 **Soroban Companion Provenance Smart Contract**: Register companion origin, generation, DNA hash, and parentage directly on the Stellar blockchain via Soroban Rust smart contracts.
- 🏆 **Player Profiles & Global Leaderboard**: Customize your player username to compete on global leaderboards. Powered by Supabase with seamless local offline fallback.
- 💳 **Stellar Testnet & Freighter Integration**: Connect Freighter wallet, fund testnet accounts with 10,000 XLM via Friendbot, monitor live ledger numbers, and track real-time transactions.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, Vite 8, Vanilla CSS (Design Tokens & Glassmorphism Aesthetics)
- **Game Engine**: Phaser 3 (Arcade Physics, Custom Particle FX, Multi-Scene Manager)
- **Blockchain Integration**: `@stellar/stellar-sdk` v16, `@stellar/freighter-api` v6
- **Smart Contract**: Soroban Rust Smart Contract (`no_std`, persistent storage, event logging)
- **Backend & Database**: Supabase JS (Row-Level Security, Profiles & Leaderboards)

---

## 🚀 Quick Start Guide

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Freighter Wallet Browser Extension](https://www.freighter.app/)

### 1. Clone & Install

```bash
git clone https://github.com/premxpagar/Stellardemoapp.git
cd Stellardemoapp
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
# Supabase (optional — game works offline using localStorage)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stellar Network
VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org

# Soroban Smart Contract (set after deploying)
VITE_STELLAR_CONTRACT_ID=your_deployed_contract_id
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Soroban Smart Contract Deployment

The Rust smart contract for companion provenance is located at `contracts/companion_provenance`.

### Build & Deploy to Stellar Testnet:

1. **Install Soroban CLI**:
   ```bash
   cargo install --locked soroban-cli
   ```

2. **Compile Contract**:
   ```bash
   cd contracts/companion_provenance
   cargo build --target wasm32-unknown-unknown --release
   ```

3. **Deploy Contract**:
   ```bash
   soroban contract deploy \
     --wasm target/wasm32-unknown-unknown/release/companion_provenance.wasm \
     --source <your-secret-key> \
     --network testnet
   ```

4. Copy the returned Contract ID (starts with `C...`) into your `.env` file as `VITE_STELLAR_CONTRACT_ID`.

---

## 🎮 How to Play

1. **My Grove**: Rest your companions to restore energy, claim your daily moonflower reward, and interact with meadow objects for bonus Stardust.
2. **Whispering Meadow Expedition**: Play the star-catching mini-game to gain XP and rare golden stars.
3. **Astral Gate (Knight Mode)**: Launch real-time action gameplay. Use WASD/Arrow keys + Attack/Dash keys (or mobile touch D-Pad) to battle eclipse guardians.
4. **Starweave Chamber**: Select two companions to fuse a brand new companion with blended DNA and potential rare mutations.
5. **Leaderboard & Profile**: Click on your avatar or Leaderboard tab to edit your player username and view your global ranking.
6. **Stellar Wallet**: Click **Connect Freighter** in the sidebar to connect your Stellar Testnet wallet, fund 10,000 XLM, and register companion provenance on-chain.

---

## 📦 Build for Production

```bash
npm run build
```

The output will be generated in the `dist/` directory, ready to deploy to Vercel, Netlify, or GitHub Pages.

---

## 📄 License

MIT License © 2026 Stellar Grove Team.
