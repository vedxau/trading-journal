# HTTPS Setup Instructions

## Overview
This backend now supports HTTPS to resolve mixed content issues when the frontend is served over HTTPS (e.g., Vercel deployment).

## Files Added
- `cert.pem` - SSL certificate file
- `key.pem` - SSL private key file
- Updated `index.js` - HTTPS server configuration

## How to Use

### Development
1. **Start the server**: The backend will now start both HTTP (port 5000) and HTTPS (port 5001) servers
2. **Access the API**: Use `https://localhost:5001` for API calls
3. **Browser warning**: You'll see a security warning in browsers due to self-signed certificates - click "Advanced" and "Proceed anyway"

### Production
For production deployment, replace the self-signed certificates with proper SSL certificates:

1. **Get SSL certificates** from a Certificate Authority (Let's Encrypt, Cloudflare, etc.)
2. **Replace certificate files**:
   - Replace `cert.pem` with your actual certificate
   - Replace `key.pem` with your actual private key
3. **Update environment variables**:
   - Set `HTTPS_PORT` to your desired HTTPS port (usually 443)
   - Set `NODE_ENV=production` to disable HTTP fallback

### Environment Variables
- `HTTPS_PORT`: HTTPS server port (default: 5001)
- `PORT`: HTTP server port (default: 5000)
- `NODE_ENV`: Set to 'production' to disable HTTP fallback

### Client Configuration
The frontend axios configuration has been updated to use HTTPS:
- Development: `https://localhost:5001`
- Production: Update `your-production-domain.com` to your actual domain

## Generating New Certificates (Optional)
If you need to generate new self-signed certificates:

```bash
# Generate private key
openssl genrsa -out key.pem 2048

# Generate certificate signing request
openssl req -new -key key.pem -out csr.pem

# Generate self-signed certificate
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem

# Clean up
rm csr.pem
```

## Troubleshooting
- **Certificate errors**: Ensure cert.pem and key.pem are in the backend directory
- **Port conflicts**: Change HTTPS_PORT if 5001 is already in use
- **Mixed content**: Ensure all API calls use HTTPS URLs
