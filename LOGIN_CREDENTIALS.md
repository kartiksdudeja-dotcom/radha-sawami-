# 🔐 Login Credentials

Use these credentials to log into the Radha Swami Portal:

## Test Users

### Administrator Account

- **Username:** `admin`
- **Password:** `admin123`
- **Access Level:** Full Admin Access

### Regular User Account

- **Username:** `user`
- **Password:** `user123`
- **Access Level:** Regular User

### Member Account

- **Username:** `SSK2009010208721`
- **Password:** `21-01-2005`
- **Access Level:** Member

---

## How to Login

1. **Local Computer:**

   - Open: http://localhost:3000
   - Enter username and password above
   - Click "Login"

2. **Mobile Device (Same WiFi):**
   - Open: http://192.168.1.101:3000
   - Enter username and password above
   - Click "Login"

---

## Notes

- ✅ Backend is running on: http://192.168.1.101:5000
- ✅ Frontend is running on: http://192.168.1.101:3000
- ✅ Passwords are stored with bcrypt encryption
- ✅ Database location: `Backend/radha_swami.db`

---

## Adding New Users

To add new users, use the signup feature or add directly to the database:

```sql
INSERT INTO members (name, username, password, is_admin, is_member, status)
VALUES ('Name', 'username', 'password_hash', 0, 1, 'Initiated');
```

> Password must be bcrypt hashed for security.
