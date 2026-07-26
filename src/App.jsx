import { useEffect, useState } from 'react'
import { isConnected, requestAccess } from '@stellar/freighter-api'
import { registerCompanionOnChain, connectWallet as connectWalletFromService, recordGameplayTx } from './services/stellarService'
import { syncProfileToSupabase } from './services/supabase'
import { achievementList, companions as starterCompanions, cosmetics, fusionReward, xpForLevel } from './game/data'
import { applyEnergyRegen, clearSave, loadSave, saveGame } from './game/save'
import Modal from './components/Modal'
import Grove from './grove/Grove'
import Companions from './grove/Companions'
import Starweave from './grove/Starweave'
import Wardrobe from './grove/Wardrobe'
import Exploration from './grove/Exploration'
import Results from './grove/Results'
import AstralGate from './grove/AstralGate'
import Inventory from './grove/Inventory'
import Leaderboard from './grove/Leaderboard'
import PlayerProfile from './grove/PlayerProfile'
import KnightMode from './knight/KnightMode'
import SettingsModal from './components/SettingsModal'
import WalletPanel from './components/WalletPanel'
import './App.css'

const random = (items) => items[Math.floor(Math.random() * items.length)]

function App() {
  const [game, setGame] = useState(() => applyEnergyRegen(loadSave()))
  const [screen, setScreen] = useState('grove')
  const [notice, setNotice] = useState('Welcome back, Keeper. Your grove is glowing.')
  const [toast, setToast] = useState('')
  const [wallet, setWallet] = useState(null)
  const [exploring, setExploring] = useState(false)
  const [results, setResults] = useState(null)
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('Level')
  const [fusionPick, setFusionPick] = useState([])
  const [fusionStage, setFusionStage] = useState('idle')
  const [showAchievements, setShowAchievements] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [knightMode, setKnightMode] = useState(false)

  const selected = game.companions.find((c) => c.id === game.selectedId) || game.companions[0]
  const equipped = game.equipped[selected?.id]
  const updateGame = (updater) => setGame((current) => typeof updater === 'function' ? updater(current) : updater)

  useEffect(() => { saveGame(game) }, [game])
  useEffect(() => { const id = setInterval(() => setGame((s) => applyEnergyRegen(s)), 60000); return () => clearInterval(id) }, [])
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 3600); return () => clearTimeout(id) }, [toast])
  useEffect(() => {
    const unlocked = achievementList.filter((a) => !game.achievements.includes(a.id) && a.check(game))
    if (unlocked.length) updateGame((s) => ({ ...s, achievements: [...s.achievements, ...unlocked.map((a) => a.id)] }))
    if (unlocked.length) setToast(`Achievement unlocked: ${unlocked[0].title}`)
  }, [game])

  const select = (id) => { updateGame((s) => ({ ...s, selectedId: id })); const c = game.companions.find((x) => x.id === id); if (c) setNotice(random(c.thoughts)) }
  const claimDaily = () => {
    const day = new Date().toDateString()
    if (game.claimedDaily === day) return setNotice('The moonflower will bloom again tomorrow.')
    updateGame((s) => ({ ...s, claimedDaily: day, stardust: s.stardust + 35, stats: { ...s.stats, stardustEarned: s.stats.stardustEarned + 35 } }))
    if (wallet?.full) {
      const tx = recordGameplayTx('Claim Daily Reward', wallet.full)
      if (tx) setToast(`Daily reward collected +35 ✦ (Testnet Fee: ${tx.xlmFee})`)
    } else {
      setToast('Daily reward collected +35 ✦')
    }
    setNotice('Daily moonflower reward: 35 Stardust!')
  }
  const interact = (name, reward, text) => {
    const now = Date.now(); if ((game.objectCooldowns?.[name] || 0) > now) return setNotice(`${name} is resting. Try again in a minute.`)
    updateGame((s) => ({ ...s, stardust: s.stardust + reward, stats: { ...s.stats, stardustEarned: s.stats.stardustEarned + reward }, objectCooldowns: { ...s.objectCooldowns, [name]: now + 60000 } }))
    if (wallet?.full) {
      recordGameplayTx(`Interact: ${name}`, wallet.full)
    }
    setNotice(text); setToast(`+${reward} Stardust`)
  }
  const rest = () => {
    updateGame((s) => ({ ...s, companions: s.companions.map((c) => c.id === selected.id ? { ...c, energy: Math.min(100, c.energy + 28) } : c) }))
    if (wallet?.full) {
      const tx = recordGameplayTx(`Rest ${selected.name}`, wallet.full)
      if (tx) setToast(`${selected.name} rested ✦ (Testnet Fee: ${tx.xlmFee})`)
    }
    setNotice(`${selected.name} had a cozy rest and recovered energy.`)
  }
  const beginExplore = () => { if (selected.energy < 15) return setNotice(`${selected.name} is too tired. Let them rest first.`); setExploring(true); setResults(null) }
  const finishExplore = (outcome) => {
    setExploring(false); setResults(outcome)
    updateGame((s) => {
      let leveled = false
      const nextCompanions = s.companions.map((c) => {
        if (c.id !== selected.id) return c
        let xp = c.xp + outcome.xp; let level = c.level
        while (xp >= xpForLevel(level)) { xp -= xpForLevel(level); level += 1; leveled = true }
        return { ...c, xp, level, energy: Math.max(0, c.energy - 15), mood: leveled ? 'Proud' : c.energy <= 30 ? 'Sleepy' : 'Bright' }
      })
      let playerXp = s.playerXp + outcome.xp; let playerLevel = s.playerLevel
      while (playerXp >= xpForLevel(playerLevel)) { playerXp -= xpForLevel(playerLevel); playerLevel += 1 }
      return { ...s, companions: nextCompanions, stardust: s.stardust + outcome.stardust, playerXp, playerLevel, stats: { ...s.stats, explorations: s.stats.explorations + 1, stardustEarned: s.stats.stardustEarned + outcome.stardust, goldStars: s.stats.goldStars + outcome.gold } }
    })
    if (wallet?.full) {
      recordGameplayTx('Complete Meadow Expedition', wallet.full)
    }
    setNotice(`${selected.name}: ${random(['That was brilliant!', 'The meadow sparkled for us!', 'I want to go again soon!'])}`)
  }
  const buyOrEquip = (item) => {
    const owns = game.unlockedCosmetics.includes(item.id)
    if (!owns && game.stardust < item.price) return setNotice(`You need ${item.price - game.stardust} more Stardust for ${item.name}.`)
    updateGame((s) => ({ ...s, stardust: owns ? s.stardust : s.stardust - item.price, unlockedCosmetics: owns ? s.unlockedCosmetics : [...s.unlockedCosmetics, item.id], equipped: { ...s.equipped, [selected.id]: s.equipped[selected.id] === item.id ? undefined : item.id } }))
    if (!owns && wallet?.full) {
      const tx = recordGameplayTx(`Adornment: ${item.name}`, wallet.full)
      if (tx) setToast(`Purchased ${item.name} ✦ (Testnet Fee: ${tx.xlmFee})`)
    }
    setNotice(owns && equipped === item.id ? `${selected.name} put the ${item.name} away.` : `${selected.name} loves the ${item.name}!`)
  }
  const fuse = () => {
    if (fusionPick.length !== 2) return setNotice('Choose two different companions to begin Starweave.')
    if (game.companions.some((c) => c.id === 'aster')) return setNotice('Aster has already joined your grove.')
    setFusionStage('weaving')
    if (wallet?.full) {
      recordGameplayTx('Starweave Companion Fusion', wallet.full)
    }
    setTimeout(() => { updateGame((s) => ({ ...s, companions: [...s.companions.filter((c) => !fusionPick.includes(c.id)), fusionReward], selectedId: 'aster', stats: { ...s.stats, fusions: s.stats.fusions + 1 } })); setFusionStage('reveal'); setNotice('Aster: I was born from a wish!') }, 1700)
  }
  const connectWallet = async () => {
    const res = await connectWalletFromService()
    if (res?.error) {
      setNotice(res.error)
      setToast(res.error)
    } else if (res?.address) {
      setWallet(res)
      setNotice(`Freighter connected (${res.truncated}) — Stellar Testnet ready.`)
      setToast('Freighter wallet connected ✦')
    }
  }
  const disconnectWallet = () => {
    setWallet(null)
    setNotice('Wallet disconnected.')
  }
  const reset = () => {
    if (!window.confirm('Reset all Stellar Grove progress? This cannot be undone.')) return
    clearSave()
    const fresh = { ...loadSave(), companions: starterCompanions }
    setGame(fresh)
    setScreen('grove')
    setShowSettings(false)
    setNotice('A fresh little grove is ready for you.')
  }

  const handleUpdateUsername = (newUsername) => {
    updateGame((s) => {
      const updated = { ...s, username: newUsername }
      syncProfileToSupabase(updated, wallet?.full)
      return updated
    })
    setToast(`Username updated to ${newUsername}!`)
  }

  const handleRegisterCompanion = async (companion) => {
    const res = await registerCompanionOnChain(wallet?.full, companion)
    if (res?.success) {
      updateGame((s) => ({
        ...s,
        companions: s.companions.map((c) => (c.id === companion.id ? { ...c, stellarRegistered: true, stellarTxHash: res.txHash } : c)),
      }))
      setToast(`${companion.name} registered on Stellar Testnet!`)
    }
    return res
  }

  /* Knight Mode handlers */
  const enterKnightMode = () => setKnightMode(true)
  const exitKnightMode = (rewards) => {
    setKnightMode(false)
    if (rewards) {
      updateGame((s) => {
        let playerXp = s.playerXp + (rewards.xp || 0)
        let playerLevel = s.playerLevel
        while (playerXp >= xpForLevel(playerLevel)) { playerXp -= xpForLevel(playerLevel); playerLevel += 1 }

        const newItems = { ...s.inventory }
        if (rewards.items) {
          for (const item of rewards.items) {
            newItems[item.id] = (newItems[item.id] || 0) + (item.qty || 1)
          }
        }

        const nextCompanions = s.companions.map((c) => {
          if (c.id !== s.selectedId) return c
          let xp = c.xp + (rewards.companionXp || 0)
          let level = c.level
          while (xp >= xpForLevel(level)) { xp -= xpForLevel(level); level += 1 }
          return {
            ...c, xp, level,
            bond: Math.min(100, (c.bond || 0) + (rewards.bondGain || 0)),
            behaviorLog: {
              ...c.behaviorLog,
              combatWins: (c.behaviorLog?.combatWins || 0) + (rewards.combatWins || 0),
              explorationCount: (c.behaviorLog?.explorationCount || 0) + (rewards.areasExplored || 0),
              bossWins: (c.behaviorLog?.bossWins || 0) + (rewards.bossWins || 0),
            }
          }
        })

        const newAchievementIds = [...s.achievements]
        if (rewards.combatWins > 0 && !newAchievementIds.includes('first-knight')) newAchievementIds.push('first-knight')
        if (rewards.bossWins > 0 && !newAchievementIds.includes('eclipse-breaker')) newAchievementIds.push('eclipse-breaker')

        const newQuests = { ...s.questProgress }
        if (rewards.questUpdates) {
          for (const [qid, val] of Object.entries(rewards.questUpdates)) {
            newQuests[qid] = Math.max(newQuests[qid] || 0, val)
          }
        }

        return {
          ...s,
          stardust: s.stardust + (rewards.stardust || 0),
          playerXp, playerLevel,
          companions: nextCompanions,
          inventory: newItems,
          achievements: newAchievementIds,
          questProgress: newQuests,
          stats: {
            ...s.stats,
            stardustEarned: s.stats.stardustEarned + (rewards.stardust || 0),
            enemiesDefeated: (s.stats.enemiesDefeated || 0) + (rewards.combatWins || 0),
            bossesDefeated: (s.stats.bossesDefeated || 0) + (rewards.bossWins || 0),
          },
          unlockedAreas: [...new Set([...(s.unlockedAreas || ['moon-meadow']), ...(rewards.unlockedAreas || [])])],
        }
      })
      if (rewards.stardust) setToast(`Knight expedition: +${rewards.stardust} ✦, +${rewards.xp} XP`)
    }
    setNotice('You step back through the portal. The grove is peaceful again.')
  }

  /* Knight Mode full screen */
  if (knightMode) {
    return (
      <KnightMode
        game={game}
        companion={selected}
        onExit={exitKnightMode}
      />
    )
  }

  const shown = [...game.companions].filter((c) => filter === 'All' || c.rarity === filter).sort((a, b) => sort === 'Name' ? a.name.localeCompare(b.name) : sort === 'Rarity' ? a.rarity.localeCompare(b.rarity) : b.level - a.level)

  return (
    <main className="app-shell game-app">
      <aside className="sidebar">
        <a className="brand" href="#top">
          <span className="brand-mark">✦</span>
          <span>stellar<br />grove</span>
        </a>
        <nav>
          {[
            ['grove', '⌂', 'My Grove'],
            ['companions', '♡', 'Companions'],
            ['fusion', '✧', 'Starweave'],
            ['wardrobe', '♧', 'Wardrobe'],
            ['inventory', '◈', 'Inventory'],
            ['gate', '⚝', 'Astral Gate'],
            ['leaderboard', '⚑', 'Leaderboard'],
          ].map(([id, i, label]) => (
            <button className={screen === id ? 'nav-item active' : 'nav-item'} onClick={() => setScreen(id)} key={id}>
              <span>{i}</span>{label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="side-link" onClick={() => setShowAchievements(true)}>🏆 Achievements</button>
          <button className="side-link" onClick={() => setShowSettings(true)}>⚙ Settings</button>
          <WalletPanel wallet={wallet} onConnect={connectWallet} onDisconnect={disconnectWallet} />
        </div>
      </aside>
      <section className={`content screen-${screen}`} id="top">
        <header>
          <div>
            <p className="eyebrow">PLAYER LEVEL {game.playerLevel}</p>
            <h1>
              {screen === 'grove' ? 'Your little universe.' :
               screen === 'companions' ? 'Companion archive.' :
               screen === 'fusion' ? 'Starweave chamber.' :
               screen === 'wardrobe' ? 'Adornment atelier.' :
               screen === 'inventory' ? 'Your supplies.' :
               screen === 'gate' ? 'The Astral Gate.' :
               screen === 'leaderboard' ? 'Top Stellar Knights.' :
               screen === 'profile' ? 'Your journey.' :
               'Stellar Grove'}
            </h1>
            <div className="player-xp">
              <i style={{ width: `${game.playerXp / xpForLevel(game.playerLevel) * 100}%` }} />
            </div>
          </div>
          <div className="resources">
            <span>✦ <b>{game.stardust}</b> stardust</span>
            <span>♡ <b>{game.companions.length}/12</b> found</span>
            <button className="avatar" onClick={() => setScreen('profile')}>K</button>
          </div>
        </header>
        <div className="notice" role="status"><span>✦</span>{notice}</div>

        {screen === 'grove' && <Grove selected={selected} hat={equipped} onExplore={beginExplore} onRest={rest} onDaily={claimDaily} onObject={interact} dailyClaimed={game.claimedDaily === new Date().toDateString()} />}
        {screen === 'companions' && <Companions list={shown} selected={selected} hatFor={(id) => game.equipped[id]} onSelect={select} filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} />}
        {screen === 'fusion' && <Starweave game={game} picks={fusionPick} setPicks={setFusionPick} stage={fusionStage} onFuse={fuse} onWelcome={() => { setFusionStage('idle'); setFusionPick([]); setScreen('companions') }} />}
        {screen === 'wardrobe' && <Wardrobe selected={selected} equipped={equipped} game={game} onItem={buyOrEquip} />}
        {screen === 'inventory' && <Inventory game={game} />}
        {screen === 'gate' && <AstralGate onEnter={enterKnightMode} game={game} wallet={wallet} />}
        {screen === 'leaderboard' && <Leaderboard game={game} />}
        {screen === 'profile' && <PlayerProfile game={game} wallet={wallet?.truncated || ''} />}
      </section>

      {exploring && <Exploration onFinish={finishExplore} onExit={() => setExploring(false)} companion={selected} hat={equipped} />}
      {results && <Results result={results} companion={selected} onReplay={beginExplore} onReturn={() => { setResults(null); setScreen('grove') }} />}
      {toast && <div className="toast">✦ {toast}</div>}
      {showAchievements && (
        <Modal title="Achievements" close={() => setShowAchievements(false)}>
          <div className="achievement-list">
            {achievementList.map((a) => (
              <div className={game.achievements.includes(a.id) ? 'achievement won' : 'achievement'} key={a.id}>
                <span>{game.achievements.includes(a.id) ? '✦' : '○'}</span>
                <div><b>{a.title}</b><small>{a.description}</small></div>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {showSettings && (
        <SettingsModal
          game={game}
          updateGame={updateGame}
          onReset={reset}
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  )
}

export default App
