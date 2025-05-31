// Initialize users array to hold registered users
let users = [];

// Function to check if localStorage is available and writable
function isLocalStorageAvailable() {
    const testKey = '__test_storage__';
    try {
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        console.error("localStorage is not available or writeable:", e);
        return false;
    }
}

// Load users from localStorage
function loadUsers() {
    if (!isLocalStorageAvailable()) {
        showError('Local storage is not available. Data will not be saved or loaded.');
        users = []; // Ensure users array is empty if storage is unavailable
        return;
    }
    try {
        const stored = localStorage.getItem('users');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                users = parsed;
            } else {
                console.warn('Invalid data found in local storage. Resetting data.');
                users = []; // Reset if data is not an array
                saveUsers(); // Try to clear invalid data from storage
            }
        } else {
            users = []; // Initialize if no data stored yet
        }
    } catch (e) {
        console.error('Error parsing or loading users from localStorage:', e);
        showError('Failed to load saved data. It might be corrupted. Data has been reset.');
        users = []; // Reset users on critical load error
        saveUsers(); // Try to clear corrupted data
    }
}

// Save users to localStorage
function saveUsers() {
    if (!isLocalStorageAvailable()) {
        console.warn('Cannot save data: Local storage is not available.');
        return;
    }
    try {
        localStorage.setItem('users', JSON.stringify(users));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        if (e.name === 'QuotaExceededError') {
            showError('Failed to save data: Storage limit reached. Please clear some browser data or entries.');
        } else {
            showError('Failed to save data. Please try again.');
        }
    }
}

// Validate email format
function isValidEmail(email) {
    // Basic email regex for common formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Calculate age from Date of Birth
function calculateAge(dobString) {
    try {
        const birthDate = new Date(dobString);
        // Check for invalid date (e.g., "2024-02-30")
        if (isNaN(birthDate.getTime())) {
            return null; // Indicates invalid date format
        }

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        // If birthday hasn't occurred yet this year, subtract 1 from age
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch (e) {
        console.error('Error calculating age:', e);
        return null; // Return null on any error during calculation
    }
}

// Display users in the table
function displayUsers() {
    const tableBody = document.getElementById('userTable');
    if (!tableBody) {
        console.error('Table body element with id "userTable" not found.');
        showError('Error: Could not find table to display users. Please check the page structure.');
        return;
    }
    tableBody.innerHTML = ''; // Clear existing table rows

    if (users.length === 0) {
        // Optionally show a message if no users
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `<td colspan="5" class="py-3 px-6 text-center text-gray-500">No registered users yet.</td>`;
        tableBody.appendChild(noDataRow);
        return;
    }

    users.forEach(user => {
        const row = document.createElement('tr');
        row.classList.add('border-b', 'border-gray-200', 'hover:bg-gray-100');
        row.innerHTML = `
            <td class="py-3 px-6 text-left whitespace-nowrap">${user.name || 'N/A'}</td>
            <td class="py-3 px-6 text-left">${user.email || 'N/A'}</td>
            <td class="py-3 px-6 text-left">${user.password || 'N/A'}</td>
            <td class="py-3 px-6 text-left">${user.dob || 'N/A'}</td>
            <td class="py-3 px-6 text-left">${user.acceptTerms ? 'true' : 'false'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Show error message in the designated div
function showError(message) {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        // Hide the error message after 5 seconds
        setTimeout(() => errorDiv.classList.add('hidden'), 5000);
    }
}

// Get the form element and add a submit event listener
const registrationForm = document.getElementById('registrationForm');
if (registrationForm) {
    registrationForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        // Get form values
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const dobInput = document.getElementById('dob');
        const acceptTermsCheckbox = document.getElementById('acceptTerms');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value; // In a real app, hash this before storing
        const dob = dobInput.value; // YYYY-MM-DD format from input type="date"
        const acceptTerms = acceptTermsCheckbox.checked;

        // --- Validation Checks ---
        if (!name) {
            showError('Please enter your name.');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address (e.g., user@example.com).');
            return;
        }

        // Password complexity check (example: minimum 6 characters)
        if (password.length < 6) { 
            showError('Password must be at least 6 characters long.');
            return;
        }

        if (!dob) {
            showError('Please enter your date of birth.');
            return;
        }

        const age = calculateAge(dob);
        if (age === null) {
            showError('Invalid date of birth. Please use YYYY-MM-DD format.');
            return;
        }
        if (age < 18 || age > 55) {
            showError('You must be between 18 and 55 years old to register.');
            return;
        }

        if (!acceptTerms) {
            showError('You must accept the Terms & Conditions.');
            return;
        }

        // Create a new user object
        const newUser = {
            name,
            email,
            password, 
            dob,
            acceptTerms
        };

        // Add the new user to the users array
        users.push(newUser);

        // Save the updated users array to localStorage
        saveUsers();

        // Update the table display
        displayUsers();

        // Clear the form fields
        registrationForm.reset();
    });
} else {
    console.error('Registration form element with id "registrationForm" not found.');
    showError('Error: The registration form could not be found. Please contact support.');
}

// Initial setup when the page loads
// Ensure the DOM is fully loaded before trying to access elements
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();     // Load any existing users from localStorage
    displayUsers();  // Display the loaded users (or an empty table)
});
