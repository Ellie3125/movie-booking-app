# Backend

## User/profile schema

Backend chi luu user/profile theo schema hien tai:

```js
{
  fullName: String,
  email: String,
  phoneNumber: String,
  avatarUrl: String,
  passwordHash: String,
  role: 'user' | 'admin',
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
}
```

Khong giu legacy aliases `name`, `phone`, `avatar`, `password`.
Request register/login/change-password co the nhan plain credential tu client, nhung backend chi hash va luu vao `passwordHash`.
API response khong tra `password` hoac `passwordHash`.
Upload anh dai dien dung multipart key `avatarFile`, URL sau khi luu nam o `avatarUrl`.

## Seed test accounts

`seeds/data/users.data.js` giu mat khau test dang plain text de de dang dang nhap khi test app. Khi chay seed, script se hash mat khau va chi insert `passwordHash` vao database.

| Portal | Email | Password |
| --- | --- | --- |
| Admin web | `admin@example.com` | `Admin@123456` |
| Admin web | `staff@example.com` | `Admin@123456` |
| Mobile app | `customer@example.com` | `Customer@123456` |
| Mobile app | `user4@gmail.com` den `user20@gmail.com` | `User@123456` |

## Reset database local/dev

Chi chay khi muon bo toan bo du lieu cu trong database local/dev.

1. Dung backend.
2. Drop database MongoDB local/dev thu cong.
3. Chay lai seed theo schema user/profile moi.

Vi du voi `mongosh`:

```sh
mongosh
use <DATABASE_NAME>
db.dropDatabase()
```

Sau do chay lai seed:

```sh
npm run seed
```

`<DATABASE_NAME>` lay tu `MONGODB_URI` trong file `.env` cua backend, thuong la phan path sau host.

Khong them logic drop database vao app startup, script backend, hoac seed runtime. Neu la production/staging, phai backup truoc khi drop.
