import { registerRoutes } from "./config/routerLoader";
import app from "./app/app";
import { errorMiddleware } from "./middleware/error-middleware";
import { SequelizeScopeError } from "sequelize";
import { laundryDB } from "./app/database";


registerRoutes(app);

app.use(errorMiddleware)

laundryDB.authenticate()
.then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });  
})
.catch((error: SequelizeScopeError) => {
  console.log(error.message)
})