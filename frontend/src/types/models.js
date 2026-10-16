/**
 * @typedef {Object} ProductOption
 * @property {string} name
 * @property {string} value
 * @property {number} [additionalPrice]
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} category
 * @property {number} price
 * @property {string} imageUrl
 * @property {boolean} available
 * @property {boolean} soldOut
 * @property {string[]} [badges]
 * @property {string[]} [ingredients]
 * @property {string[]} [allergens]
 * @property {number} [calories]
 * @property {"none"|"low"|"medium"|"high"} [caffeineLevel]
 * @property {ProductOption[]} [options]
 */

/**
 * @typedef {Object} Customer
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} [phone]
 * @property {string} [memberNumber]
 * @property {"regular"|"silver"|"gold"} [membershipTier]
 * @property {number} [rewardLeaves]
 * @property {"active"|"deactivated"} [accountStatus]
 */

/**
 * @typedef {Object} OrderItem
 * @property {string} productId
 * @property {string} productName
 * @property {number} quantity
 * @property {number} unitPrice
 * @property {number} totalPrice
 * @property {ProductOption[]} [selectedOptions]
 * @property {string} [specialInstructions]
 */

/**
 * @typedef {Object} Location
 * @property {string} id
 * @property {string} name
 * @property {string} address
 * @property {boolean} isOpen
 * @property {string} [estimatedPickupTime]
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} [customerId]
 * @property {string} [customerName]
 * @property {OrderItem[]} items
 * @property {number} subtotal
 * @property {number} estimatedTax
 * @property {number} total
 * @property {"new"|"preparing"|"ready"|"completed"|"cancelled"|"refunded"} status
 * @property {Location} pickupLocation
 * @property {string} [pickupDate]
 * @property {string} [pickupTime]
 * @property {"pending"|"paid"|"refunded"} paymentStatus
 * @property {string} [specialInstructions]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} StaffAccount
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} roleId
 * @property {string} [locationId]
 * @property {boolean} active
 */

/**
 * @typedef {Object} Role
 * @property {string} id
 * @property {string} name
 * @property {string[]} permissions
 */

/**
 * @typedef {Object} AuditLog
 * @property {string} id
 * @property {string} staffAccountId
 * @property {string} action
 * @property {string} targetType
 * @property {string} targetId
 * @property {string} [reason]
 * @property {string} createdAt
 */

export {}