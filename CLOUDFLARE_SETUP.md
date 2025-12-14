# Cloudflare Configuration for CRM PLUS Branch

## DNS Records for Branch Testing

### Quick Setup (Copy-Paste Ready)

```
# Frontend - Branch Test Domain
Type:   CNAME
Name:   test
Content: cname.vercel-dns.com
Proxy:  Proxied (🟠 Orange Cloud ON)
TTL:    Auto

# Backend - API (Already configured)
Type:   CNAME  
Name:   api
Content: crm-plus-production.up.railway.app
Proxy:  Proxied (🟠 Orange Cloud ON)
TTL:    Auto
```

Result: `https://test.crmplus.com` → This branch on Vercel

## Cloudflare Settings

### SSL/TLS Configuration
- **SSL/TLS encryption mode**: Full (strict)
- **Always Use HTTPS**: ON
- **Automatic HTTPS Rewrites**: ON
- **Minimum TLS Version**: 1.2

### Speed Settings
- **Auto Minify**: 
  - ✅ JavaScript
  - ✅ CSS
  - ✅ HTML
- **Brotli**: ON

### Caching
- **Caching Level**: Standard
- **Browser Cache TTL**: Respect Existing Headers

### Security
- **Security Level**: Medium
- **Challenge Passage**: 30 Minutes
- **Browser Integrity Check**: ON

## Page Rules (Optional)

### Rule 1: Force HTTPS
```
URL: http://test.crmplus.com/*
Settings:
  - Always Use HTTPS
```

### Rule 2: Cache Optimization
```
URL: test.crmplus.com/_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 month
```

### Rule 3: API Bypass Cache
```
URL: api.crmplus.com/*
Settings:
  - Cache Level: Bypass
```

## Firewall Rules (Optional - Enhanced Security)

### Block Bad Bots
```
Expression: (cf.client.bot)
Action: Block
```

### Rate Limiting
```
Expression: (http.request.uri.path contains "/api/")
Action: Rate limit (100 requests per minute)
```

## DNS Configuration via Cloudflare API (Automation)

If you want to automate DNS setup:

```bash
# Set your variables
CLOUDFLARE_API_TOKEN="your_api_token"
ZONE_ID="your_zone_id"
DOMAIN="test.crmplus.com"

# Create CNAME record
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "test",
    "content": "cname.vercel-dns.com",
    "ttl": 1,
    "proxied": true
  }'
```

## Verification Commands

```bash
# Check DNS propagation
dig test.crmplus.com

# Should show Cloudflare IPs (proxied)
# Example: 104.21.x.x or 172.67.x.x

# Check HTTPS
curl -I https://test.crmplus.com

# Should return 200 OK

# Check SSL certificate
echo | openssl s_client -servername test.crmplus.com -connect test.crmplus.com:443 2>/dev/null | openssl x509 -noout -issuer

# Should show Cloudflare or Let's Encrypt
```

## Cloudflare Analytics

After setup, monitor:
- Requests
- Bandwidth
- Threats blocked
- Cache hit ratio

Access: Cloudflare Dashboard → Analytics → Web Analytics

## Custom Hostnames (Enterprise Feature)

If you have Cloudflare for SaaS:

```bash
# Add custom hostname
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/custom_hostnames" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "hostname": "test.crmplus.com",
    "ssl": {
      "method": "http",
      "type": "dv"
    }
  }'
```

## Troubleshooting

### DNS not resolving
1. Wait 1-5 minutes (Cloudflare propagation is fast)
2. Check record exists in Cloudflare DNS
3. Verify proxy status (orange cloud)
4. Purge DNS cache: `ipconfig /flushdns` or `sudo dscacheutil -flushcache`

### SSL Error
1. Check SSL/TLS mode: Must be "Full (strict)"
2. Verify Vercel has provisioned SSL (check Vercel Dashboard)
3. Purge Cloudflare cache
4. Try Edge Certificate renewal in Cloudflare

### Too Many Redirects
1. Change SSL/TLS mode to "Full (strict)"
2. Disable "Always Use HTTPS" temporarily
3. Check Vercel settings for HTTPS redirect

### Slow Loading
1. Enable Cloudflare cache
2. Enable Auto Minify
3. Enable Brotli compression
4. Check Cloudflare Analytics for bottlenecks

## Branch-Specific Domains

You can create multiple subdomains for different branches:

```
test.crmplus.com           → copilot/create-domain-for-branch
staging.crmplus.com        → staging
dev.crmplus.com            → development
feature-xyz.crmplus.com    → feature/xyz
```

Just add a CNAME for each in Cloudflare, then configure in Vercel.

## Security Headers (Cloudflare Workers)

For enhanced security, add a Cloudflare Worker:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const response = await fetch(request)
  const newHeaders = new Headers(response.headers)
  
  // Security headers
  newHeaders.set('X-Frame-Options', 'DENY')
  newHeaders.set('X-Content-Type-Options', 'nosniff')
  newHeaders.set('X-XSS-Protection', '1; mode=block')
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  newHeaders.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  })
}
```

Deploy to route: `test.crmplus.com/*`

## Cost Considerations

**Cloudflare Free Tier** includes:
- ✅ Unlimited DNS queries
- ✅ DDoS protection
- ✅ SSL certificates
- ✅ CDN caching
- ✅ Basic analytics

**Paid Features** (not required):
- Advanced DDoS
- Image optimization
- Workers (enhanced)
- Argo Smart Routing
- Page Rules (3 free, more with Pro)

For most testing scenarios, the **Free tier is sufficient**.

## Next Steps

1. ✅ Add CNAME record in Cloudflare
2. ✅ Enable orange cloud (Proxy)
3. ✅ Set SSL to "Full (Strict)"
4. ✅ Add domain in Vercel
5. ✅ Wait for DNS propagation (1-5 min)
6. ✅ Test: `curl -I https://test.crmplus.com`
7. ✅ Share URL for testing!

---

**Status**: Ready for configuration  
**Domain**: test.crmplus.com (or your choice)  
**Platform**: Vercel + Cloudflare  
**Branch**: copilot/create-domain-for-branch
