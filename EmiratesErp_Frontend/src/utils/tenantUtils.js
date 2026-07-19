const MASTER_HOSTS = ['localhost', 'emirateserp', 'www', '127.0.0.1'];

/**
 * Extracts the tenant ID from the URL subdomain.
 * For local development, it checks for a ?tenant= query parameter first.
 * If the hostname is a known master host (e.g. localhost, www), it returns 'master'.
 * @returns {string} The resolved tenant ID.
 */
export function getTenantFromSubdomain() {
    // 1. Dev override: check query param ?tenant=acme
    const params = new URLSearchParams(window.location.search);
    const tenantParam = params.get('tenant');
    if (tenantParam) {
        return tenantParam;
    }

    // 2. Extract from hostname
    const hostname = window.location.hostname; // e.g. "acme.emirateserp.com"
    const parts = hostname.split('.');
    
    // E.g., if it's just "localhost" or an IP address
    if (parts.length < 2 || parts.length === 4 && !isNaN(parts[0])) {
        return 'master';
    }
    
    const subdomain = parts[0].toLowerCase();
    
    // If the subdomain is one of the reserved master hosts, default to master
    if (MASTER_HOSTS.includes(subdomain)) {
        return 'master';
    }

    return subdomain;
}
