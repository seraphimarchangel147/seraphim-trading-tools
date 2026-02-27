<scratchpad>
Task: Test ETH grid optimization
Mathematical flaw: Current grid spacing is static 1.0%
Proposed fix: Implement dynamic spacing based on Bollinger Bands
Edge cases: Flash crashes, extreme MEV, RPC rate limits
Calculation: 
- Base spacing = 0.025 (2.5%)
- Band width = 2 * std_dev
- Dynamic multiplier = min(3.0, max(0.5, volatility / avg_volatility))
</scratchpad>
