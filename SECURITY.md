# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in BarStripeLab, please email:
**sudarshantechlabs@gmail.com**

⚠️ **DO NOT** open a public issue for security vulnerabilities.

## What We Do

- Acknowledge your report within 48 hours
- Investigate and fix the issue
- Credit you in the security advisory (if desired)
- Release a patched version

## Security Best Practices

When using BarStripeLab:

- ✅ Keep Node.js updated to latest LTS
- ✅ Use HTTPS when deploying to production
- ✅ Validate user input on backend (if adding backend)
- ✅ Never expose API keys in frontend code
- ✅ Use environment variables for sensitive data

## Known Limitations

- This is a client-side app (MVP phase)
- No user authentication
- No database
- Data is not persisted

## Future Security Considerations

When Phase 2+ adds:
- User accounts → Use OAuth/JWT
- Database → Encrypt sensitive data
- API → Rate limiting & CORS
- File uploads → Validate server-side

## Security Update History

- v1.0.0 - Initial release (2026)
