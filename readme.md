
# GC Express

- 🚀 GC Express — Fondasi solid berbasis TypeScript untuk membangun aplikasi Express lebih cepat, rapi, dan scalable.
- 💡 GC Express: Solusi ringan namun powerful untuk pengembangan backend berbasis Express + TypeScript. Kode lebih bersih, kerja lebih cepat.
- 🔥 Hemat waktu setup dan langsung produktif! GC Express hadir sebagai core Express TypeScript yang siap pakai.




## Features

- GC Model : fungsi yang ada pada sequilize di tambahkan seperti FindOrFail, paginate dan search.
- GC Router : membuat route, middleware (auth, guest, roles), dan handler routing 
- GC Auth : validate jwt token dan get data payload dari jwt token
- Route Loader 
- Sequelize (PostgreSQL)


## Installation

Clone Github GC Express

```bash
  git clone https://github.com/sigitriawan11/gc-express.git
```
```bash
  npm install
```

```bash
  npm run dev
```

    
## Environment Variables

Untuk menjalankan proyek ini, Anda perlu menambahkan variabel berikut ke file .env Anda


`PORT=3010` 

`NODE_ENV=STAGING` 

`SECRET_ACCESS_TOKEN=GCEXPRESS123`

`SECRET_REFRESH_TOKEN=GCEXPRESS321`

`DB_PORT_STAGING = 5432`

`DB_HOST_STAGING = 127.0.0.1`

`DB_USER_STAGING = postgres`

`DB_PWD_STAGING = root`

NODE_ENV sesuai kebutuhan bisa di tambahkan variabel lain misalnya DEVELOPMENT atau PRODUCTION dan buat variabel DB untuk hal tersebut.
## Set instance DB untuk running server

src/app/database.ts
```typescript
import { Sequelize, Options } from "sequelize";
import { dbConfig } from "../config/database";

const config:Options = dbConfig

const createInstance = (database:string) : Sequelize => {
  const dbSpecificConfig: Options = {
    ...config,
    database,
  };
  return new Sequelize(dbSpecificConfig)
}

export const DB = createInstance('db_name')
```


## Update file main.ts
src/main.ts
```typescript
import { registerRoutes } from "./config/routerLoader";
import app from "./app/app";
import { errorMiddleware } from "./middleware/error-middleware";
import { usermanagementDB } from "./app/database";
import { SequelizeScopeError } from "sequelize";


registerRoutes(app);

app.use(errorMiddleware)

DB.authenticate()
.then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });  
})
.catch((error: SequelizeScopeError) => {
  console.log(error.message)
})
```

## Buat route pertama mu

Buat file apapun pada src/controller.

Semua nama file pada controller (e.g user.ts) akan menjadi path route di file tersebut.

src/controllers/user.ts
```typescript
GCRouter.get().handler((req, res, next) => {
    try {
        res.status(200).json({
            message: 'Hello GC Express'
        })
    } catch (error) {
        next(error)
    }
})
```
```typescript
GCRouter.get('gc').handler((req, res, next) => {
    try {
        res.status(200).json({
            message: 'Hello GC Express'
        })
    } catch (error) {
        next(error)
    }
})
```
Maka route anda menjadi






```http
  GET /user
```
```http
  GET /user/gc
```

Jika anda ingin menginginkan base path pada route anda maka ubah file src/main.ts

```typescript
registerRoutes(app, {
  basePath: '/api'
});
```
Maka route anda 
```http
  GET /api/user
```
```http
  GET /api/user/gc
```




## Lisensi

GC Express menggunakan lisensi MIT.
Bebas digunakan, bebas dikembangkan.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

