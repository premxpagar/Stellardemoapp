import { useState, useEffect, useCallback } from 'react'
import './WalletPanel.css'

const HORIZON_TESTNET = 'https://horizon-testnet.stellar.org'
const FRIENDBOT_URL = 'https://friendbot.stellar.org'

export default function WalletPanel({ wallet, onConnect, onDisconnect }) {
  const [balance, setBalance] = useState(null)
  const [funding, setFunding] = useState(false)
  const [fundResult, setFundResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [latestLedger, setLatestLedger] = useState(null)
  const [recentTxs, setRecentTxs] = useState([])

  const fullAddress = wallet?.full || ''
  const truncated = wallet?.truncated || ''

  const fetchBalance = useCallback(async () => {
    if (!fullAddress) return
    setLoading(true)
    try {
      const res = await fetch(`${HORIZON_TESTNET}/accounts/${fullAddress}`)
      if (res.status === 404) {
        setBalance({ funded: false, xlm: '0' })
      } else {
        const data = await res.json()
        const native = data.balances?.find((b) => b.asset_type === 'native')
        setBalance({
          funded: true,
          xlm: native ? parseFloat(native.balance).toFixed(2) : '0.00',
          subentryCount: data.subentry_count || 0,
          sequence: data.sequence,
        })
      }
    } catch {
      setBalance(null)
    }
    setLoading(false)
  }, [fullAddress])

  /* Fetch live Stellar Testnet ledger sequence & transactions */
  const fetchLiveNetworkData = useCallback(async () => {
    try {
      const ledgerRes = await fetch(`${HORIZON_TESTNET}/ledgers?order=desc&limit=1`)
      if (ledgerRes.ok) {
        const data = await ledgerRes.json()
        const currentSeq = data._embedded?.records?.[0]?.sequence
        if (currentSeq) setLatestLedger(currentSeq)
      }

      if (fullAddress) {
        const txRes = await fetch(`${HORIZON_TESTNET}/accounts/${fullAddress}/transactions?order=desc&limit=3`)
        if (txRes.ok) {
          const txData = await txRes.json()
          const records = txData._embedded?.records || []
          setRecentTxs(records.map((r) => ({
            id: r.id,
            hash: r.hash,
            createdAt: new Date(r.created_at).toLocaleTimeString(),
            fee: r.fee_charged,
            successful: r.successful,
          })))
        }
      }
    } catch (err) {
      console.warn('[Stellar Horizon Live Fetch Error]', err)
    }
  }, [fullAddress])

  useEffect(() => {
    if (fullAddress) {
      fetchBalance()
      fetchLiveNetworkData()
    }
    const interval = setInterval(fetchLiveNetworkData, 10000)
    return () => clearInterval(interval)
  }, [fullAddress, fetchBalance, fetchLiveNetworkData])

  useEffect(() => {
    if (fundResult) {
      const id = setTimeout(() => setFundResult(null), 6000)
      return () => clearTimeout(id)
    }
  }, [fundResult])

  const fundAccount = async () => {
    if (!fullAddress || funding) return
    setFunding(true)
    setFundResult(null)
    try {
      const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(fullAddress)}`)
      if (res.ok) {
        setFundResult({ ok: true, msg: '10,000 XLM added' })
        setTimeout(() => {
          fetchBalance()
          fetchLiveNetworkData()
        }, 1500)
      } else {
        const err = await res.json().catch(() => ({}))
        const detail = err?.detail || ''
        if (detail.includes('createAccountAlreadyExist')) {
          setFundResult({ ok: false, msg: 'Already funded — one per account' })
        } else {
          setFundResult({ ok: false, msg: 'Friendbot unavailable, try later' })
        }
      }
    } catch {
      setFundResult({ ok: false, msg: 'Network error' })
    }
    setFunding(false)
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(fullAddress).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  /* Not connected */
  if (!wallet) {
    return (
      <div className="wp">
        <div className="wp-empty">
          <div className="wp-icon-ring">
            <span className="wp-icon">◇</span>
          </div>
          <p className="wp-label">Stellar Testnet</p>
          <p className="wp-hint">Connect your Freighter wallet to fund a testnet account and interact with Soroban contracts.</p>
          <button className="wp-connect" onClick={onConnect}>
            Connect Freighter
          </button>
          <a
            className="wp-ext-link"
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Don't have Freighter? ↗
          </a>
        </div>
      </div>
    )
  }

  /* Connected */
  return (
    <div className="wp">
      <div className="wp-header">
        <span className="wp-net-dot" />
        <span className="wp-net-label">TESTNET {latestLedger ? `#${latestLedger}` : ''}</span>
        <button className="wp-disconnect" onClick={onDisconnect} title="Disconnect">
          ✕
        </button>
      </div>

      <div className="wp-address-row" onClick={copyAddress} title="Copy full address">
        <span className="wp-addr">{truncated}</span>
        <span className="wp-copy">{copied ? '✓ Copied' : 'Copy'}</span>
      </div>

      {/* Balance */}
      <div className="wp-balance-area">
        {loading ? (
          <div className="wp-loading">
            <span className="wp-spinner" /> Loading…
          </div>
        ) : balance?.funded ? (
          <>
            <p className="wp-balance">{balance.xlm}</p>
            <p className="wp-unit">XLM</p>
          </>
        ) : (
          <>
            <p className="wp-balance wp-zero">0.00</p>
            <p className="wp-unit">XLM · Not funded</p>
          </>
        )}
      </div>

      {/* Fund with Friendbot */}
      <button
        className={`wp-fund ${funding ? 'wp-funding' : ''}`}
        onClick={fundAccount}
        disabled={funding}
      >
        {funding ? (
          <>
            <span className="wp-spinner" /> Requesting…
          </>
        ) : (
          'Fund with Friendbot'
        )}
      </button>

      {fundResult && (
        <div className={`wp-result ${fundResult.ok ? 'wp-result-ok' : 'wp-result-err'}`}>
          {fundResult.ok ? '✓' : '!'} {fundResult.msg}
        </div>
      )}

      {/* Live Transaction Monitor */}
      {recentTxs.length > 0 && (
        <div style={{
          marginTop: '10px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '6px',
          padding: '8px',
          fontSize: '0.75rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.7, marginBottom: '4px' }}>
            <span>Live Testnet Txs</span>
            <span>{recentTxs.length} recent</span>
          </div>
          {recentTxs.slice(0, 2).map((tx) => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#9ce8ff', textDecoration: 'none', fontFamily: 'monospace' }}
              >
                {tx.hash.slice(0, 6)}…{tx.hash.slice(-4)}
              </a>
              <span style={{ color: tx.successful ? '#8df4a4' : '#ff8b8b' }}>
                {tx.successful ? '✓ Success' : '✕ Failed'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Details toggle */}
      <button className="wp-details-toggle" onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? 'Hide details ▴' : 'Account details ▾'}
      </button>

      {showDetails && (
        <div className="wp-details">
          <div className="wp-detail-row">
            <span>Network</span>
            <span>Stellar Testnet</span>
          </div>
          <div className="wp-detail-row">
            <span>Horizon</span>
            <span className="wp-mono">horizon-testnet.stellar.org</span>
          </div>
          <div className="wp-detail-row">
            <span>Status</span>
            <span>{balance?.funded ? 'Active' : 'Unfunded'}</span>
          </div>
          {latestLedger && (
            <div className="wp-detail-row">
              <span>Latest Ledger</span>
              <span className="wp-mono">#{latestLedger}</span>
            </div>
          )}
          {balance?.funded && (
            <div className="wp-detail-row">
              <span>Sub-entries</span>
              <span>{balance.subentryCount}</span>
            </div>
          )}
          <div className="wp-detail-row">
            <span>Full address</span>
            <span className="wp-mono wp-addr-full">{fullAddress}</span>
          </div>
          <a
            className="wp-ext-link"
            href={`https://stellar.expert/explorer/testnet/account/${fullAddress}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Stellar Expert ↗
          </a>
        </div>
      )}

      <button className="wp-refresh" onClick={() => { fetchBalance(); fetchLiveNetworkData() }} disabled={loading}>
        ↻ Refresh network state
      </button>
    </div>
  )
}
