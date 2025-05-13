/// Constants for precision
const DECIMALS: u64 = 1_000_000_000;
const U64_MAX: u64 = 18446744073709551615;

/// Computes (1 - k)^(t - n^2) in fixed-point arithmetic using binary exponentiation
fn pow_fixed(base: u64, exponent: i128) -> u64 {
    if exponent < 0 {
        let pos_pow = pow_fixed(base, -exponent);
        if pos_pow == 0 {
            return U64_MAX;
        } else {
            return ((DECIMALS as u128 * DECIMALS as u128) / pos_pow as u128) as u64;
        }
    }

    if exponent == 0 {
        return DECIMALS;
    }

    if base == 0 {
        return 0;
    }

    if base == DECIMALS {
        return DECIMALS;
    }

    let mut result = DECIMALS;
    let mut base = base;
    let mut exp = exponent;

    while exp > 0 {
        if exp & 1 == 1 {
            result = ((result as u128 * base as u128) / DECIMALS as u128) as u64;
        }
        base = ((base as u128 * base as u128) / DECIMALS as u128) as u64;
        exp >>= 1;
    }

    result
}

/// sqrt_vrgda(t, n) = p0 * (1 - k)^(t - n^2)
pub fn sqrt_vrgda_price(p0: u64, k: u64, t: i64, n: i64) -> u64 {
    let one = DECIMALS;

    // Compute t - n^2
    let n_squared = (n as u128).pow(2);
    let delta = t as i128 - n_squared as i128;

    // base = (1 - k)
    let base = one - k;

    // decay = (1 - k)^(t - n^2)
    let decay = pow_fixed(base, delta);

    // price = p0 * decay
    let price = (p0 as u128 * decay as u128) / DECIMALS as u128;

    price as u64
}

#[cfg(test)]
mod tests {

    use super::*;
    /// Price max is slightly different from U64_MAX due to final multiplication with u128 conversion
    const PRICE_MAX: u64 = 1844674407370955161;

    #[test]
    fn test_sqrt_vrgda_price_basic() {
        // Base price of 1 SOL (denominated in lamports)
        let p0 = 1_000_000_000;
        // k = 0.1 (10% decay rate) in fixed point
        let k = DECIMALS / 10;

        // At t=n^2, price should be exactly p0
        assert_eq!(sqrt_vrgda_price(p0, k, 1, 1), p0);
        assert_eq!(sqrt_vrgda_price(p0, k, 4, 2), p0);
        assert_eq!(sqrt_vrgda_price(p0, k, 9, 3), p0);
    }

    #[test]
    fn test_sqrt_vrgda_price_exact() {
        // Base price of 1 SOL (denominated in lamports)
        let p0 = 1_000_000_000;
        // k = 0.1 (10% decay rate) in fixed point
        let k = DECIMALS / 10;
        let t = 5;

        // At t=n^2, price should be exactly 656100000
        // >>> import math
        // >>> math.ceil(((10**9)*(1*10**9-0.1*10**9)**(5-1))/(10**(9*4)))
        assert!(sqrt_vrgda_price(p0, k, t, 1) == 656100000);
    }

    fn realistic_setup(mins_from_start: i64) -> (u64, u64, i64, i64) {
        // Base price of 0.1 SOL (denominated in lamports)
        let p0 = 1_000_000_000 / 10;
        // 0.01% price decay per slot
        let k = DECIMALS / 10_000;
        // time is now Solana slot number
        let t0 = 339754967;
        // 5 minutes, roughly 3 slots per second (400 ms block time)
        let t = t0 + mins_from_start * 60 * 3;

        (p0, k, t0, t)
    }

    fn try_short_term_min_realistic(n: i64, t: i64) {
        let (p0, k, t0, t) = realistic_setup(t);
        let expected_result_lamports =
            (DECIMALS as f64 * 0.1 * ((1.0 - 0.01 / 100.0) as f64).powf((t - t0 - n * n) as f64))
                as u64;
        let actual_price = sqrt_vrgda_price(p0, k, t - t0, n);

        let difference = if actual_price > expected_result_lamports {
            actual_price - expected_result_lamports
        } else {
            expected_result_lamports - actual_price
        };

        let tolerance = expected_result_lamports / 1000; // 0.1% tolerance

        assert!(
            difference <= tolerance,
            "Price difference too large: actual={}, expected={}, diff={}, tolerance={}",
            actual_price,
            expected_result_lamports,
            difference,
            tolerance
        );
    }

    #[test]
    fn test_precision_different_n() {
        for n in 0..100 {
            try_short_term_min_realistic(n, 5);
        }
    }

    #[test]
    fn test_precision_different_t() {
        for t in 0..100 {
            try_short_term_min_realistic(5, t);
        }
    }

    #[test]
    fn test_large_values() {
        let (p0, k, _, _) = realistic_setup(1);
        assert_eq!(sqrt_vrgda_price(p0, k, 1, 100_000), PRICE_MAX);
        let one_week_slot_count = 7 * 24 * 60 * 60 * 3;
        assert_eq!(sqrt_vrgda_price(p0, k, one_week_slot_count, 1), 0);
        assert_eq!(
            sqrt_vrgda_price(p0, k, one_week_slot_count, 100_000),
            PRICE_MAX
        );
    }

    #[test]
    fn test_sqrt_vrgda_price_decay() {
        let p0 = 1_000_000_000;
        let k = DECIMALS / 10; // 10% decay

        // Price should decrease when t > n^2
        let price_at_equilibrium = sqrt_vrgda_price(p0, k, 4, 2);
        let price_after = sqrt_vrgda_price(p0, k, 5, 2);
        assert!(price_after < price_at_equilibrium);

        // Price should increase when t < n^2
        let price_before = sqrt_vrgda_price(p0, k, 3, 2);
        assert!(price_before > price_at_equilibrium);
    }

    #[test]
    fn test_sqrt_vrgda_price_zero_decay() {
        let p0 = 1_000_000_000;
        let k = 0; // No decay

        // Price should remain constant regardless of t
        assert_eq!(sqrt_vrgda_price(p0, k, 100, 5), p0);
        assert_eq!(sqrt_vrgda_price(p0, k, 1000, 5), p0);
    }

    #[test]
    fn test_sqrt_vrgda_price_high_decay() {
        let p0 = 1_000_000_000;
        let k = DECIMALS / 2; // 50% decay

        // With high decay, price should drop rapidly for t > n^2
        let price_at_t4 = sqrt_vrgda_price(p0, k, 4, 2);
        let price_at_t5 = sqrt_vrgda_price(p0, k, 5, 2);

        // Ensure significant price drop (at least 40% drop)
        assert!(price_at_t5 < price_at_t4 * 6 / 10);
    }
}
