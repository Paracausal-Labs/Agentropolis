
import { describe, it, expect, mock } from "bun:test";
import { parseAgentConfig, getDefaultAgentConfig } from "../lib/ens/textRecords";

// Mocking the viem imports because we can't easily mock the network calls in this environment without complex setup
// Instead, we will focus on testing the logic of parsing and defaults, which is critical for correctness.
// If possible, we can mock `readAgentConfig` by mocking the `sepoliaClient` import if bun supports module mocking easily,
// but let's stick to unit testing the pure functions first to ensure logic correctness.

describe("ENS Configuration Logic", () => {

    it("should return default config", () => {
        const config = getDefaultAgentConfig();
        expect(config).toEqual({
            risk: 'medium',
            strategy: 'dca',
            tokens: ['USDC', 'WETH'],
        });
    });

    it("should parse valid config correctly", () => {
        const raw = {
            risk: 'high',
            strategy: 'momentum',
            tokens: 'ETH, DAI',
            endpoint: 'https://api.example.com',
        };
        const config = parseAgentConfig(raw);
        expect(config.risk).toBe('high');
        expect(config.strategy).toBe('momentum');
        expect(config.tokens).toEqual(['ETH', 'DAI']);
        expect(config.agentEndpoint).toBe('https://api.example.com');
    });

    it("should fallback to defaults for invalid values", () => {
        const raw = {
            risk: 'extreme', // Invalid
            strategy: 'unknown', // Invalid
            tokens: null,
            endpoint: null,
        };
        const config = parseAgentConfig(raw);
        expect(config.risk).toBe('medium'); // Default
        expect(config.strategy).toBe('dca'); // Default
        expect(config.tokens).toEqual(['USDC', 'WETH']); // Default
        expect(config.agentEndpoint).toBeUndefined();
    });

    it("should handle empty tokens string", () => {
        const raw = {
            tokens: '',
        };
        const config = parseAgentConfig(raw);
        expect(config.tokens).toEqual(['USDC', 'WETH']);
    });

    it("should handle partial updates", () => {
        const raw = {
            risk: 'low',
            // missing other fields
        };
        const config = parseAgentConfig(raw);
        expect(config.risk).toBe('low');
        expect(config.strategy).toBe('dca'); // Default
    });
});
