/**
 * POS Database Seeder Configuration
 * ===================================
 * Adjust these settings before running the seeder.
 */

module.exports = {
  // API Base URL (must match your backend)
  API_URL: 'http://localhost:8080/api',

  // Token file path (relative to project root)
  // The seeder will read the JWT token from this file.
  TOKEN_FILE: './token.txt',

  // Delay between API calls in milliseconds (avoids overwhelming the server)
  REQUEST_DELAY_MS: 80,

  // Number of records to seed per table
  SEED_COUNT: 50,

  // Login credentials for auto-token fetch (used if token.txt is empty)
  // Fill these in with your actual ERP login details.
  LOGIN_CREDENTIALS: {
    tenantId: 'TENANT_ID_HERE',   // e.g. 'emirates-erp' or your tenant subdomain
    email: 'admin@example.com',   // your ERP admin email
    password: 'your_password',    // your ERP admin password
  },
};

