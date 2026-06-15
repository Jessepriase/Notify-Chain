use soroban_sdk::{contractevent, Address, BytesN};

/// Emitted when a new AutoShare group is created.
#[contractevent(data_format = "single-value")]
#[derive(Clone)]
pub struct AutoshareCreated {
    #[topic]
    pub creator: Address,
    pub id: BytesN<32>,
}

/// Emitted when the contract is paused by the admin.
#[contractevent]
#[derive(Clone)]
pub struct ContractPaused {}

/// Emitted when the contract is unpaused by the admin.
#[contractevent]
#[derive(Clone)]
pub struct ContractUnpaused {}

/// Emitted when an AutoShare group's member list is updated.
#[contractevent(data_format = "single-value")]
#[derive(Clone)]
pub struct AutoshareUpdated {
    #[topic]
    pub updater: Address,
    pub id: BytesN<32>,
}

/// Emitted when an AutoShare group is deactivated by its creator.
#[contractevent(data_format = "single-value")]
#[derive(Clone)]
pub struct GroupDeactivated {
    #[topic]
    pub creator: Address,
    pub id: BytesN<32>,
}

/// Emitted when a deactivated AutoShare group is reactivated by its creator.
#[contractevent(data_format = "single-value")]
#[derive(Clone)]
pub struct GroupActivated {
    #[topic]
    pub creator: Address,
    pub id: BytesN<32>,
}

/// Emitted when the admin rights of the contract are transferred.
#[contractevent(data_format = "single-value")]
#[derive(Clone)]
pub struct AdminTransferred {
    #[topic]
    pub old_admin: Address,
    pub new_admin: Address,
}

/// Emitted when the admin withdraws collected usage fees from the contract.
#[contractevent(data_format = "single-value")]
#[derive(Clone)]
pub struct Withdrawal {
    #[topic]
    pub token: Address,
    #[topic]
    pub recipient: Address,
    pub amount: i128,
}
