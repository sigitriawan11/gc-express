import { GCRouter } from "../config/router";
import { AuthService } from "../service/auth/auth-service";
import { AuthValidation } from "../validation/auth-validation";
import { Validation } from "../validation/validate";

GCRouter.Group()
  .middleware("guest")
  .use((route) => {
    route.post("login").handler(async (req, res, next) => {
      try {
        const validation = Validation.validate(
          AuthValidation.RequestSignin,
          req.body
        );

        const response = await AuthService.SiginIn(validation);
        res.status(200).json({
          status: true,
          message: "Successfully login",
          data: response,
        });
      } catch (error) {
        next(error);
      }
    });
  })

GCRouter.post("logout")
  .middleware("auth")
  .handler(async (req, res, next) => {
    try {
      await AuthService.logout({ jwt_payload: req.jwt_payload });
      res.status(200).json({
        status: true,
        message: "Successfully logout",
      });
    } catch (error) {
      next(error);
    }
  });
GCRouter.get("me")
  .middleware("auth")
  .handler(async (req, res, next) => {
    try {
      const data = await AuthService.me(req.jwt_payload.id_profile);
      res.status(200).json({
        status: true,
        message: "Successfully get data",
        data: data
      });
    } catch (error) {
      next(error);
    }
  });
