import CryptoJS from 'crypto-js';

/**
 * NEXURA End-to-End Encryption Service
 * Implements AES-256 for secure message transport in Global Nerve.
 */
export const EncryptionService = {
  // System-level pepper for additional hash complexity
  SYSTEM_PEPPER: 'NEXURA_NERVE_SIGMA_99',

  /**
   * Simple but robust AES-256 encryption for demo environment
   * In a full enterprise config, we'd use ECDH for shared secrets.
   */
  encrypt: (text: string, secret: string): string => {
    try {
      const key = secret + EncryptionService.SYSTEM_PEPPER;
      return CryptoJS.AES.encrypt(text, key).toString();
    } catch (e) {
      console.error('Encryption Failure:', e);
      return '[[SECURE_TRANSMISSION_FAILED]]';
    }
  },

  decrypt: (cipherText: string, secret: string): string => {
    try {
      const key = secret + EncryptionService.SYSTEM_PEPPER;
      const bytes = CryptoJS.AES.decrypt(cipherText, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error('Decryption Failure:', e);
      return '[[CIPHER_INTEGRITY_VIOLATED]]';
    }
  }
};
