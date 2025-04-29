import { registerRoutes } from "./config/routerLoader";
import app from "./app/app";
import { errorMiddleware } from "./middleware/error-middleware";
import { usermanagementDB } from "./app/database";
import { SequelizeScopeError } from "sequelize";


registerRoutes(app);

app.use(errorMiddleware)

usermanagementDB.authenticate()
.then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });  
})
.catch((error: SequelizeScopeError) => {
  console.log(error.message)
})