// ===========================
//    REWARDS CONFIGURATION
// ===========================

// ------- TEA LEAF EARNING RATE -------

export const DOLLARS_PER_TEA_LEAF = 0.10;                                                                               // Customers earn 1 Tea Leaf for every $0.10 spent, excluding tax.

// ------- TEA LEAF CALCULATION -------

export function calculateTeaLeaves(subtotal) {                                                                          // Calculate earned Tea Leaves based on the order subtotal.
    const subtotalInCents = Math.round(subtotal * 100);                                                                 // Convert the subtotal to cents to avoid floating-point rounding errors.
    const centsPerLeaf = Math.round(DOLLARS_PER_TEA_LEAF * 100);                                                        // Convert the configurable earning rate to cents.

    return Math.floor(subtotalInCents / centsPerLeaf);                                                                  // Award only whole Tea Leaves.
}