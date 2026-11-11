 // ===========================
 //    CHECKOUT STORAGE
 // ===========================

 const CHECKOUT_STORAGE_KEY = 'instea-checkout';                                 // Shared storage key for checkout information.

 // ===========================
 //    LOAD CHECKOUT DATA
 // ===========================

 export function loadCheckoutData() {

     try {

         const savedData = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);         // Retrieve saved checkout information.

         if (!savedData) {
             return {};                                                          // Return an empty object if checkout has not started.
         }

         const parsedData = JSON.parse(savedData);                               // Convert the stored JSON into a JavaScript object.

         return parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)
             ? parsedData
             : {};                                                               // Reject invalid checkout data.

     } catch {
         return {};                                                              // Prevent corrupted storage from crashing checkout.
     }
 }

 // ===========================
 //    SAVE CHECKOUT DATA
 // ===========================

 export function saveCheckoutData(updates) {

     const currentData = loadCheckoutData();                                     // Preserve information saved by earlier checkout steps.

     const updatedData = {
         ...currentData,
         ...updates,                                                             // Update only the fields supplied by the current page.
     };

     sessionStorage.setItem(
         CHECKOUT_STORAGE_KEY,
         JSON.stringify(updatedData)                                             // Store checkout information for later pages.
     );

     return updatedData;
 }

 // ===========================
 //    CLEAR CHECKOUT DATA
 // ===========================

 export function clearCheckoutData() {

     sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);                            // Clear checkout information after an order is completed.
 }