# Website Security & Functionality Standards

**Prepared by:** Kashi Kweyu
**Date:** April 2026
**Subject:** Recommended Standards for a Secure and Operationally Sound Website

---

## Executive Summary

This document outlines the security and operational standards a modern business website should meet. The recommendations apply to most websites — including informational sites, e-commerce platforms, healthcare portals, and internal tools — and are based on established industry frameworks, including OWASP guidelines and best practices for data protection.

The recommendations are organized into seven categories. Each item is tagged by priority:

- **Critical** — mandatory for security and basic trustworthiness
- **Security** — strongly recommended industry best practice
- **Performance** — improves user experience and search visibility
- **Functional** — operational essentials for day-to-day reliability
- **Compliance** — required where personal or sensitive data is handled

A total of 45 standards are covered. Items relating to compliance should be reviewed against the laws of the country in which the website operates and any industry-specific regulations.

---

## 1. Foundation and Hosting

The infrastructure the website runs on.

| Priority | Standard | Purpose |
|---|---|---|
| Critical | HTTPS enforced site-wide | All traffic encrypted using a valid SSL/TLS certificate. HTTP requests automatically redirected to HTTPS. |
| Critical | TLS 1.2 or higher only | Older protocols such as TLS 1.0 and 1.1 are disabled. |
| Critical | Reputable hosting provider with documented uptime | Minimum 99.9% uptime SLA, transparent server location. |
| Security | Automatic SSL renewal | Certificates renewed before expiry without manual intervention. |
| Security | DNSSEC enabled on the domain | Protects against DNS spoofing and cache poisoning. |
| Security | Server location aligned with audience | Geographically appropriate server locations for primary user base. |
| Functional | Staging environment separate from production | Changes tested in a non-public environment before going live. |

---

## 2. Application Security

Protecting the website itself from attack.

| Priority | Standard | Purpose |
|---|---|---|
| Critical | Software and dependencies kept up to date | CMS, frameworks, plugins, and libraries patched promptly. |
| Critical | Strong authentication for administrative access | Two-factor authentication on all admin accounts; strong password policy. |
| Critical | Protection against the OWASP Top 10 | Defenses against injection, broken authentication, cross-site scripting, and other common vulnerabilities. |
| Critical | Input validation and output sanitization | All user input validated on the server side before processing. |
| Security | Web Application Firewall (WAF) active | Filters malicious traffic before it reaches the application. |
| Security | Rate limiting on forms and APIs | Prevents brute-force attacks and abuse of public endpoints. |
| Security | Security headers configured | HSTS, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy. |
| Security | CAPTCHA or equivalent on public forms | Reduces automated form submissions and spam. |
| Security | File upload restrictions | Permitted file types, size limits, and virus scanning where uploads are accepted. |
| Security | Secure session management | Session tokens expire appropriately, invalidated on logout. |

---

## 3. Data Protection

Safeguarding any data stored or transmitted.

| Priority | Standard | Purpose |
|---|---|---|
| Critical | Sensitive data encrypted at rest | Database fields containing personal or sensitive information encrypted. |
| Critical | Sensitive data encrypted in transit | All data exchanges between client and server use TLS. |
| Critical | Passwords hashed with a modern algorithm | bcrypt, scrypt, or argon2. Never plain text or weak hashing such as MD5. |
| Security | Principle of least privilege for database access | Application accounts have only the permissions strictly required. |
| Security | Personally identifiable information minimized | Only data essential to the service is collected and retained. |
| Security | Defined data retention and deletion policy | Data deleted or anonymized when no longer required. |
| Security | Secure handling of API keys and secrets | Credentials stored in environment variables or a secrets manager, never in source code. |

---

## 4. Backups and Recovery

Ensuring the website can be restored after failure or attack.

| Priority | Standard | Purpose |
|---|---|---|
| Critical | Automated daily backups | Both files and database backed up on a daily schedule. |
| Critical | Backups stored in a separate location | Off-server or off-site storage to survive infrastructure compromise. |
| Security | Backup retention policy defined | Multiple historical backups retained, not just the most recent. |
| Security | Restore procedure tested regularly | At least quarterly verification that backups can be successfully restored. |
| Functional | Documented disaster recovery plan | Written process for restoring service after major incidents. |

---

## 5. Performance and Reliability

Making the site fast, available, and resilient.

| Priority | Standard | Purpose |
|---|---|---|
| Performance | Page load time under 3 seconds | Measured on a typical mobile connection for the target audience. |
| Performance | Images optimized and properly sized | Modern formats such as WebP where supported, responsive image sizing. |
| Performance | Browser and CDN caching configured | Static assets cached appropriately to reduce server load and improve speed. |
| Performance | Content Delivery Network for global audiences | CDN configured where users span multiple regions. |
| Performance | Code minification and compression | CSS, JavaScript, and HTML minified; gzip or Brotli compression enabled. |
| Functional | Mobile-responsive design | Functional and readable on screens from 320px upward. |
| Functional | Cross-browser compatibility | Tested on current versions of Chrome, Safari, Firefox, and Edge. |
| Functional | Uptime monitoring active | External monitoring with alerts for downtime. |

---

## 6. Compliance and Legal

Required where the site collects, processes, or displays personal data.

| Priority | Standard | Purpose |
|---|---|---|
| Compliance | Privacy policy published and accurate | Reflects actual data collection and processing practices. |
| Compliance | Terms of service published | Defines the relationship between the operator and visitors. |
| Compliance | Cookie consent mechanism | Where cookies are used, explicit consent obtained where required by law. |
| Compliance | Data subject rights honored | Process for handling access, correction, and deletion requests. |
| Compliance | Compliance with applicable data protection law | GDPR, Uganda DPPA 2019, Kenya DPA 2019, or other relevant frameworks. |
| Compliance | Accessibility standards met | WCAG 2.1 Level AA as a minimum target for public-facing sites. |

---

## 7. Operational Essentials

The configuration that makes the site discoverable, monitored, and maintainable.

| Priority | Standard | Purpose |
|---|---|---|
| Functional | Custom domain configured correctly | Primary domain and any redirects properly set up. |
| Functional | Professional email on the same domain | Email addresses such as `info@yourcompany.com` rather than free providers. |
| Functional | Search engine optimization basics | Title tags, meta descriptions, structured data, sitemap, and robots.txt. |
| Functional | Analytics configured | A privacy-respecting analytics platform tracking key metrics. |
| Functional | Error logging and monitoring | Application errors logged and reviewed regularly. |
| Functional | Documentation for ongoing maintenance | Written procedures for routine tasks, credentials handover, and emergency contacts. |

---

## Mandatory Standards Summary

The following ten standards are non-negotiable for any professional website. They form the minimum baseline regardless of industry or audience:

1. HTTPS enforced site-wide with TLS 1.2 or higher
2. Software and dependencies kept up to date
3. Strong authentication, including two-factor authentication for administrators
4. Defenses against the OWASP Top 10 vulnerabilities
5. Input validation and output sanitization
6. Sensitive data encrypted at rest and in transit
7. Passwords hashed with a modern algorithm
8. Automated daily backups stored separately from the live site
9. Privacy policy and terms of service published
10. Compliance with the applicable data protection law

---

## Recommended Verification Tools

After implementation, the following tools can be used to confirm the site meets these standards:

| Tool | Purpose |
|---|---|
| ssllabs.com | Verifies SSL/TLS configuration |
| securityheaders.com | Checks HTTP security headers |
| observatory.mozilla.org | Comprehensive security audit |
| pagespeed.web.dev | Performance and Core Web Vitals analysis |
| gtmetrix.com | Page speed and optimization recommendations |
| wave.webaim.org | Accessibility audit |
| sitecheck.sucuri.net | Malware and blacklist scan |
| owasp.org/www-project-zap | Vulnerability scanning |

---

## Recommended Implementation Sequence

For a new build, the following order is recommended:

1. Domain, hosting, and SSL certificate provisioned.
2. CMS or framework installed with the latest versions.
3. Authentication, encryption, and security headers configured.
4. Privacy policy, terms of service, and cookie consent published.
5. Backup automation configured and first backup verified.
6. Performance optimizations applied.
7. Analytics, monitoring, and error logging activated.
8. Verification tools run; results documented.
9. Maintenance documentation prepared and shared.

For an existing site, a phased approach is recommended, prioritizing Critical items first, followed by Security items, and addressing the remainder during planned maintenance windows.

---

## Ongoing Maintenance

A website is not a one-time deliverable. Ongoing maintenance is essential to keep it secure and functional. The following minimum cadence is recommended:

- **Weekly:** Review error logs, uptime reports, and security alerts.
- **Monthly:** Apply software and plugin updates; review backup logs.
- **Quarterly:** Test backup restoration; review user access; run verification tools.
- **Annually:** Review privacy policy and terms; comprehensive security audit; review hosting plan against current needs.

---

*This document is intended as a planning and reference resource. Specific requirements may vary depending on the website's purpose, audience, and regulatory environment. It should be reviewed alongside any organization-specific information security and data protection policies.*
