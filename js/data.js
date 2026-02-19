// =========================================
// MEWADA STORE — DATA & STORAGE MANAGER
// =========================================

const APP_CONFIG = {
    WHATSAPP_NUMBER: '917490994777',
    STORAGE_KEY: 'mewada_products_enc', // Changed key to indicate encryption
    SECRET_KEY: 'mewada_secure_v1', // Simple key for XOR obfuscation
    ADMIN_SESSION_KEY: 'mewada_admin_session'
};

// DEFAULT_PRODUCTS replaced by ENCRYPTED_PRODUCTS_DB from js/products_db.js

// =========================================
// ENCRYPTION UTILS (XOR Cipher)
// =========================================
const CryptoUtils = {
    encrypt: function (text) {
        if (!text) return '';
        const key = APP_CONFIG.SECRET_KEY;
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(result); // Convert to Base64 to make it safe for storage
    },

    decrypt: function (encoded) {
        if (!encoded) return '';
        try {
            const text = atob(encoded); // Decode Base64
            const key = APP_CONFIG.SECRET_KEY;
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return result;
        } catch (e) {
            console.error('Decryption failed', e);
            return null;
        }
    }
};

// =========================================
// DATA MANAGER
// =========================================
const DataManager = {
    getProducts: function () {
        const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
        if (stored) {
            try {
                // Try decrypting
                const decrypted = CryptoUtils.decrypt(stored);
                if (decrypted) {
                    return JSON.parse(decrypted);
                }
            } catch (e) {
                console.warn('Data corruption or format change, resetting to default.');
            }
        }
        if (typeof ENCRYPTED_PRODUCTS_DB !== 'undefined') {
            const defaults = CryptoUtils.decrypt(ENCRYPTED_PRODUCTS_DB);
            return defaults ? JSON.parse(defaults) : [];
        }
        return [];
    },

    saveProducts: function (products) {
        const json = JSON.stringify(products);
        const encrypted = CryptoUtils.encrypt(json);
        localStorage.setItem(APP_CONFIG.STORAGE_KEY, encrypted);
    },

    getProductById: function (id) {
        const products = this.getProducts();
        return products.find(p => p.id === String(id));
    },

    // Check if we need to migrate from old plain text storage
    init: function () {
        const oldKey = 'mewada_products';
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
            console.log('Migrating legacy data to encrypted storage...');
            try {
                const products = JSON.parse(oldData);
                this.saveProducts(products);
                localStorage.removeItem(oldKey);
            } catch (e) {
                console.error('Migration failed');
            }
        }
    }
};

// Initialize on load
DataManager.init();
