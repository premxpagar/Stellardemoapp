/**
 * Stellar & Soroban smart contract service.
 * Wraps Freighter API and @stellar/stellar-sdk for companion provenance contract interactions.
 */

import { isConnected, requestAccess, getAddress, signTransaction } from '@stellar/freighter-api'
import {
  Contract,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  rpc,
} from '@stellar/stellar-sdk'

const NETWORK = import.meta.env.VITE_STELLAR_NETWORK || 'testnet'
const CONTRACT_ID = import.meta.env.VITE_STELLAR_CONTRACT_ID || ''
const RPC_URL = import.meta.env.VITE_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET

/**
 * Connect Freighter wallet with full API compatibility & error reporting.
 * Handles boolean or object return values from @stellar/freighter-api.
 *
 * @returns {Promise<{ address: string, full: string, truncated: string, network: string } | { error: string }>}
 */
export async function connectWallet() {
  try {
    let hasFreighter = false
    try {
      const conn = await isConnected()
      if (typeof conn === 'boolean') {
        hasFreighter = conn
      } else if (conn && typeof conn === 'object') {
        hasFreighter = conn.isConnected ?? !conn.error
      }
    } catch {
      hasFreighter = typeof window !== 'undefined' && !!window.freighter
    }

    if (!hasFreighter && typeof window !== 'undefined' && !window.freighter) {
      return {
        error: 'Freighter extension not found. Please install the Freighter wallet extension and ensure it is unlocked.',
      }
    }

    let address = ''

    /* Try requestAccess() */
    try {
      const res = await requestAccess()
      if (typeof res === 'string') {
        address = res
      } else if (res && typeof res === 'object') {
        if (res.address) address = res.address
        else if (res.error) return { error: `Freighter error: ${res.error}` }
      }
    } catch (e) {
      console.warn('[Stellar] requestAccess failed, trying getAddress:', e.message)
    }

    /* Fallback to getAddress() */
    if (!address) {
      try {
        const addrRes = await getAddress()
        if (typeof addrRes === 'string') {
          address = addrRes
        } else if (addrRes && typeof addrRes === 'object' && addrRes.address) {
          address = addrRes.address
        }
      } catch (e) {
        console.warn('[Stellar] getAddress fallback failed:', e.message)
      }
    }

    if (!address) {
      return {
        error: 'Unlock Freighter wallet and click "Allow" to connect to Stellar Testnet.',
      }
    }

    return {
      address,
      full: address,
      truncated: `${address.slice(0, 5)}…${address.slice(-4)}`,
      network: NETWORK,
    }
  } catch (err) {
    console.error('[Stellar Connect Error]', err)
    return {
      error: err.message || 'Failed to connect to Freighter wallet.',
    }
  }
}

/**
 * Check if the Soroban companion provenance contract is configured.
 */
export function isContractConfigured() {
  return !!CONTRACT_ID
}

/**
 * Get the current Stellar network and contract status.
 */
export function getStellarStatus() {
  return {
    network: NETWORK,
    contractId: CONTRACT_ID || null,
    contractConfigured: !!CONTRACT_ID,
    rpcUrl: RPC_URL,
  }
}

/**
 * Register a companion on the Soroban smart contract.
 *
 * @param {string} walletAddress - Owner's Stellar G... address
 * @param {object} companion - Companion object
 * @returns {Promise<{ success: boolean, txHash?: string, error?: string }>}
 */
export async function registerCompanionOnChain(walletAddress, companion) {
  if (!CONTRACT_ID) {
    return {
      success: false,
      error: 'Soroban contract is not configured. Deploy companion_provenance contract and set VITE_STELLAR_CONTRACT_ID in .env',
    }
  }

  if (!walletAddress) {
    return {
      success: false,
      error: 'Stellar wallet is not connected. Connect Freighter first.',
    }
  }

  try {
    const server = new rpc.Server(RPC_URL)
    const account = await server.getAccount(walletAddress)
    const contract = new Contract(CONTRACT_ID)

    const companionId = companion.id || `companion-${Date.now()}`
    const dnaHash = companion.dnaHash || (companion.dna ? String(companion.dna.seed || '') : '00000000')
    const generation = companion.generation || 1
    const parentA = companion.parentA || 'none'
    const parentB = companion.parentB || 'none'
    const mutation = companion.mutation || 'none'

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'register_companion',
          nativeToScVal(companionId, { type: 'string' }),
          nativeToScVal(dnaHash, { type: 'string' }),
          nativeToScVal(generation, { type: 'u32' }),
          nativeToScVal(parentA, { type: 'string' }),
          nativeToScVal(parentB, { type: 'string' }),
          nativeToScVal(mutation, { type: 'string' })
        )
      )
      .setTimeout(30)
      .build()

    /* Simulate transaction on Soroban RPC */
    const simResult = await server.simulateTransaction(tx)

    if (rpc.Api.isSimulationError(simResult)) {
      throw new Error(`Soroban simulation failed: ${simResult.error || 'Contract execution reverted.'}`)
    }

    const preparedTx = rpc.assembleTransaction(tx, simResult).build()

    /* Sign via Freighter wallet */
    const signedXdr = await signTransaction(preparedTx.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    })

    if (!signedXdr) {
      throw new Error('Transaction signing was cancelled by user.')
    }

    /* Submit to Stellar Testnet */
    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE)
    const sendResult = await server.sendTransaction(signedTx)

    if (sendResult.status === 'PENDING' || sendResult.status === 'SUCCESS') {
      return {
        success: true,
        txHash: sendResult.hash,
        status: sendResult.status,
      }
    } else {
      throw new Error(`Transaction submission failed: ${sendResult.status}`)
    }
  } catch (err) {
    console.error('[Soroban Error]', err)
    return {
      success: false,
      error: err.message || 'Soroban transaction failed.',
    }
  }
}

/**
 * Fetch companion provenance record directly from Soroban contract.
 * @param {string} companionId
 */
export async function getCompanionOnChain(companionId) {
  if (!CONTRACT_ID) return null

  try {
    const server = new rpc.Server(RPC_URL)
    const contract = new Contract(CONTRACT_ID)

    /* Build read-only call */
    const tx = new TransactionBuilder(
      { sequenceNumber: '0', accountId: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF' },
      { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE }
    )
      .addOperation(contract.call('get_companion', nativeToScVal(companionId, { type: 'string' })))
      .setTimeout(30)
      .build()

    const sim = await server.simulateTransaction(tx)
    if (rpc.Api.isSimulationSuccess(sim) && sim.result?.retval) {
      return scValToNative(sim.result.retval)
    }
    return null
  } catch (err) {
    console.warn('[Soroban Read] Failed to read companion provenance:', err.message)
    return null
  }
}

/**
 * Get total registered companions count from contract.
 */
export async function getTotalRegisteredOnChain() {
  if (!CONTRACT_ID) return 0

  try {
    const server = new rpc.Server(RPC_URL)
    const contract = new Contract(CONTRACT_ID)

    const tx = new TransactionBuilder(
      { sequenceNumber: '0', accountId: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF' },
      { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE }
    )
      .addOperation(contract.call('total_registered'))
      .setTimeout(30)
      .build()

    const sim = await server.simulateTransaction(tx)
    if (rpc.Api.isSimulationSuccess(sim) && sim.result?.retval) {
      return scValToNative(sim.result.retval)
    }
    return 0
  } catch {
    return 0
  }
}
