import { registerRoutes } from "./config/routerLoader";
import app from "./app/app";
import { errorMiddleware } from "./middleware/error-middleware";
import { GCRouter } from "./config/router";


registerRoutes(app);

app.use(errorMiddleware)

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
