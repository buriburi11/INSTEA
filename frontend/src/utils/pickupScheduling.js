
 // ===========================
 //    PICKUP CONFIGURATION
 // ===========================

 export const PICKUP_PREPARATION_MINUTES = 15;                                                                          // Minimum preparation time before an order can be picked up.
 export const PICKUP_INTERVAL_MINUTES = 15;                                                                             // Generate pickup slots in 15-minute intervals.
 export const PICKUP_DAYS_AHEAD = 3;                                                                                    // Display today and the next two calendar days.

 // ===========================
 //    PICKUP DATE GENERATION
 // ===========================

 export function getPickupDates() {

     const today = new Date();                                                                                          // Use the customer's current local date.
     today.setHours(0, 0, 0, 0);                                                                                        // Normalize to midnight before adding days.

     return Array.from({ length: PICKUP_DAYS_AHEAD }, (_, index) => {

         const date = new Date(today);                                                                                  // Create an independent date for each option.
         date.setDate(today.getDate() + index);                                                                         // Advance the calendar date.

         return {
             value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
             label: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date),
             date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
         };
     });
 }


 // ===========================
 //    PICKUP TIME GENERATION
 // ===========================

 export function getPickupTimes(selectedDate, pickupHours) {

     // ------- VALIDATE STORE HOURS -------

     if (!selectedDate || !pickupHours?.open || !pickupHours?.close) {
         return [];                                                                                                     // Don't generate times without a date and valid store hours.
     }

     const [year, month, day] = selectedDate.split('-').map(Number);                                                    // Read the selected date in local calendar format.
     const [openHour, openMinute] = pickupHours.open.split(':').map(Number);                                            // Convert the opening time into hours and minutes.
     const [closeHour, closeMinute] = pickupHours.close.split(':').map(Number);                                         // Convert the closing time into hours and minutes.

     const now = new Date();                                                                                            // Get the current local time.
     const earliestPickup = new Date(now.getTime() + PICKUP_PREPARATION_MINUTES * 60000);
     const openingTime = new Date(year, month - 1, day, openHour, openMinute);
     const closingTime = new Date(year, month - 1, day, closeHour, closeMinute);

     const times = [];

     // ------- GENERATE AVAILABLE TIME SLOTS -------

     for (
         let slot = openingTime.getTime();
         slot < closingTime.getTime();
         slot += PICKUP_INTERVAL_MINUTES * 60000
     ) {

         const slotDate = new Date(slot);                                                                               // Convert the current slot into a Date object.
         const isPast = slotDate < earliestPickup;                                                                      // Disable slots that don't allow enough preparation time.

         times.push({
             value: `${String(slotDate.getHours()).padStart(2, '0')}:${String(slotDate.getMinutes()).padStart(2, '0')}`,
             label: slotDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
             disabled: isPast,
         });
     }

     return times;
 }

 // ===========================
 //    LOCATION OPEN STATUS
 // ===========================

 export function getLocationStatus(pickupHours) {

     // ------- VALIDATE STORE HOURS -------

     if (!pickupHours?.open || !pickupHours?.close) {
         return { label: 'Hours unavailable', isOpen: false };                                                          // Avoid displaying an incorrect open/closed status.
     }

     const now = new Date();                                                                                            // Use the current local time.
     const currentMinutes = now.getHours() * 60 + now.getMinutes();

     const [openHour, openMinute] = pickupHours.open.split(':').map(Number);
     const [closeHour, closeMinute] = pickupHours.close.split(':').map(Number);

     const openingMinutes = openHour * 60 + openMinute;
     const closingMinutes = closeHour * 60 + closeMinute;

     // ------- FORMAT STORE HOURS -------

     const formatTime = (hour, minute) => {
         const date = new Date();
         date.setHours(hour, minute, 0, 0);
         return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
     };

     // ------- CHECK WHETHER STORE IS OPEN -------

     const isOpen = currentMinutes >= openingMinutes && currentMinutes < closingMinutes;

     return {
         isOpen,
         label: isOpen
             ? `Open · until ${formatTime(closeHour, closeMinute)}`
             : `Closed · opens ${formatTime(openHour, openMinute)}`,
     };
 }

