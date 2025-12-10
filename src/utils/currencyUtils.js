// utils/currencyUtils.js
import { toWords } from 'number-to-words';

export const convertToWords = (amount) => {
  if (!amount || amount === 0) return 'Zero Rupees Only';
  
  try {
    // Convert to string with 2 decimal places to avoid floating point issues
    const amountString = Number(amount).toFixed(2);
    const parts = amountString.split('.');
    const rupees = parseInt(parts[0]);
    const paisa = parseInt(parts[1]);
    
    let words = toWords(rupees) + ' Rupees';
    
    if (paisa > 0) {
      // Handle paisa conversion
      if (paisa < 10) {
        // Single digit paisa (e.g., 05, 08)
        words += ' and ' + toWords(paisa) + ' Paisa';
      } else if (paisa < 100) {
        // Two digit paisa (e.g., 10, 50, 99)
        words += ' and ' + toWords(paisa) + ' Paisa';
      }
    }
    
    return words + ' Only';
  } catch (error) {
    console.error('Error converting amount to words:', error);
    return 'Amount in words conversion failed';
  }
};