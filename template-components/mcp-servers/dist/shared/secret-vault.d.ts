/**
 * SecretVault - In-memory encrypted credential storage
 *
 * Provides secure temporary storage for credentials during provisioning.
 * All secrets are encrypted with AES-256-CBC and stored only in memory.
 * The vault is destroyed when provisioning completes.
 */
export declare class SecretVault {
    private secrets;
    private encryptionKey;
    private isDestroyed;
    constructor();
    /**
     * Store a secret value with encryption
     */
    store(key: string, value: string): Promise<void>;
    /**
     * Retrieve and decrypt a secret value
     */
    retrieve(key: string): Promise<string | null>;
    /**
     * Resolve template references like {{secrets.xxx}}
     * Used in provisioning plan execution
     */
    resolve(reference: string): Promise<string>;
    /**
     * List all stored secret keys (not values)
     */
    listKeys(): string[];
    /**
     * Check if a secret exists
     */
    has(key: string): boolean;
    /**
     * Delete a specific secret
     */
    delete(key: string): boolean;
    /**
     * Clear all secrets and destroy the vault
     * IMPORTANT: This is irreversible
     */
    destroy(): void;
    /**
     * Get vault status
     */
    getStatus(): {
        secretCount: number;
        isDestroyed: boolean;
    };
}
/**
 * Utility: Generate a secure random password
 */
export declare function generatePassword(length?: number): string;
/**
 * Utility: Mask a secret value for display
 */
export declare function maskSecret(value: string, visibleChars?: number): string;
//# sourceMappingURL=secret-vault.d.ts.map