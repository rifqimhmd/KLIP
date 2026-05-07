# 🔒 Security Fix Instructions for Production Server

## 1️⃣ Disable Debug Mode (.env file)

**File:** `/var/www/html/backend/.env` (di server VPS)

Ubah menjadi:
```env
APP_ENV=production
APP_DEBUG=false
```

## 2️⃣ Security Headers (Sudah Aktif ✅)

File `SecurityHeaders.php` sudah ada dan sudah diregister di `bootstrap/app.php`.
Headers yang aktif:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation=(), microphone=(), camera=()
- Content-Security-Policy: default-src 'self'
- Strict-Transport-Security (untuk HTTPS)

## 3️⃣ Error Message Protection (Sudah Aktif ✅)

File `bootstrap/app.php` sudah diupdate. Error detail tidak akan muncul ketika APP_DEBUG=false.

## 4️⃣ Upload ke Server

```bash
# Copy ke server VPS
scp -r backend/ admin@10.1.2.196:/var/www/html/

# Set permissions
chmod -R 755 /var/www/html/backend
chmod -R 775 /var/www/html/backend/storage
chmod -R 775 /var/www/html/backend/bootstrap/cache
```

## 5️⃣ Restart Services

```bash
sudo systemctl restart apache2
```

## ✅ Summary Perbaikan

| Vulnerability | Status | File Diubah |
|--------------|--------|-------------|
| .env exposure | ✅ Fixed | `public/.htaccess` |
| Directory listing | ✅ Fixed | `public/assets/.htaccess` |
| Error message leak | ✅ Fixed | `bootstrap/app.php` |
| Security Headers | ✅ Fixed | `SecurityHeaders.php` (sudah ada) |
| HTTPS | ⚠️ Manual Setup | Requires SSL Certificate |

**Catatan:** File `.env` harus diubah manual di server karena tidak masuk git.
