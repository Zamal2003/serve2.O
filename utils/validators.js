// utils/validators.js

/**
 * Validates if a string is in YYYY-MM-DD format and represents a valid date
 * @param {string} dateString - The date string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidDate(dateString) {
    // Basic format check
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return false;
    }

    // Parse the date
    const date = new Date(dateString);
    const timestamp = date.getTime();

    // Check if the date is valid
    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
        return false;
    }

    // Verify the parsed components match the input
    const [year, month, day] = dateString.split('-');
    return (
        date.getFullYear() === parseInt(year, 10) &&
        date.getMonth() + 1 === parseInt(month, 10) &&
        date.getDate() === parseInt(day, 10)
    );
}

module.exports = {
    isValidDate
};