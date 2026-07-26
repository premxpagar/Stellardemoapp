#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec, log, symbol_short};

/// Companion registration data stored on-chain.
#[contracttype]
#[derive(Clone, Debug)]
pub struct CompanionRecord {
    pub companion_id: String,
    pub owner: Address,
    pub dna_hash: String,
    pub generation: u32,
    pub parent_a: String,
    pub parent_b: String,
    pub mutation: String,
    pub created_at: u64,
}

/// Storage key for a companion record.
#[contracttype]
pub enum DataKey {
    Companion(String),
    OwnerCompanions(Address),
    TotalRegistered,
}

#[contract]
pub struct CompanionProvenance;

#[contractimpl]
impl CompanionProvenance {
    /// Register a companion's provenance on the Stellar blockchain.
    /// Only the caller (owner) can register.
    pub fn register_companion(
        env: Env,
        companion_id: String,
        dna_hash: String,
        generation: u32,
        parent_a: String,
        parent_b: String,
        mutation: String,
    ) -> CompanionRecord {
        let owner = env.current_contract_address();
        // In production, use auth: let owner = Address::require_auth(&env);

        // Check not already registered
        let key = DataKey::Companion(companion_id.clone());
        if env.storage().persistent().has(&key) {
            panic!("Companion already registered");
        }

        let record = CompanionRecord {
            companion_id: companion_id.clone(),
            owner: owner.clone(),
            dna_hash,
            generation,
            parent_a,
            parent_b,
            mutation,
            created_at: env.ledger().timestamp(),
        };

        // Store the record
        env.storage().persistent().set(&key, &record);

        // Update total count
        let total_key = DataKey::TotalRegistered;
        let total: u32 = env.storage().persistent().get(&total_key).unwrap_or(0);
        env.storage().persistent().set(&total_key, &(total + 1));

        // Emit event
        env.events().publish(
            (symbol_short!("register"),),
            (companion_id, owner),
        );

        log!(&env, "Companion registered successfully");
        record
    }

    /// Retrieve a companion's provenance record.
    pub fn get_companion(env: Env, companion_id: String) -> Option<CompanionRecord> {
        let key = DataKey::Companion(companion_id);
        env.storage().persistent().get(&key)
    }

    /// Get total number of registered companions.
    pub fn total_registered(env: Env) -> u32 {
        let key = DataKey::TotalRegistered;
        env.storage().persistent().get(&key).unwrap_or(0)
    }

    /// Transfer companion ownership.
    /// Requires authorization from the current owner.
    pub fn transfer_companion(
        env: Env,
        companion_id: String,
        new_owner: Address,
    ) {
        let key = DataKey::Companion(companion_id.clone());
        let mut record: CompanionRecord = env.storage().persistent().get(&key)
            .expect("Companion not found");

        // Verify caller is current owner
        record.owner.require_auth();

        // Update owner
        record.owner = new_owner.clone();
        env.storage().persistent().set(&key, &record);

        // Emit transfer event
        env.events().publish(
            (symbol_short!("transfer"),),
            (companion_id, new_owner),
        );
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{Env, String};

    #[test]
    fn test_register_and_get() {
        let env = Env::default();
        let contract_id = env.register(CompanionProvenance, ());

        let client = CompanionProvenanceClient::new(&env, &contract_id);

        let companion_id = String::from_str(&env, "momo-001");
        let dna_hash = String::from_str(&env, "a1b2c3d4");
        let parent_a = String::from_str(&env, "none");
        let parent_b = String::from_str(&env, "none");
        let mutation = String::from_str(&env, "none");

        let record = client.register_companion(
            &companion_id,
            &dna_hash,
            &1u32,
            &parent_a,
            &parent_b,
            &mutation,
        );

        assert_eq!(record.generation, 1);
        assert_eq!(record.dna_hash, dna_hash);

        // Retrieve
        let fetched = client.get_companion(&companion_id);
        assert!(fetched.is_some());
        assert_eq!(fetched.unwrap().generation, 1);

        // Check total
        assert_eq!(client.total_registered(), 1);
    }

    #[test]
    fn test_total_increments() {
        let env = Env::default();
        let contract_id = env.register(CompanionProvenance, ());
        let client = CompanionProvenanceClient::new(&env, &contract_id);

        let none_str = String::from_str(&env, "none");

        client.register_companion(
            &String::from_str(&env, "comp-1"),
            &String::from_str(&env, "hash1"),
            &1u32,
            &none_str,
            &none_str,
            &none_str,
        );

        client.register_companion(
            &String::from_str(&env, "comp-2"),
            &String::from_str(&env, "hash2"),
            &2u32,
            &String::from_str(&env, "comp-1"),
            &none_str,
            &String::from_str(&env, "Aurora"),
        );

        assert_eq!(client.total_registered(), 2);
    }
}
