import { GCRouter } from "../config/router";

GCRouter.get()
.middleware(['auth', 'roles:super_admin|member'])
.upload.single('file')
.handler((req, res, next) => {
  res.send({})
})
GCRouter.get("user")
.middleware(['auth', 'roles:super_admin|member'])
.upload.single('file')
.handler((req, res, next) => {
  res.send({})
})

GCRouter.Group().middleware(['auth']).use((router) => {
  router.get('test').handler((req, res, next) => {
    res.send({})
  })
  router.get('test/1').middleware('roles:super_admin').handler((req, res, next) => {
    res.send({})
  })
})

GCRouter.Group().middleware(['auth', 'roles:super_admin']).use((router) => {
  router.get('test2').handler((req, res, next) => {
    res.send({})
  })
  router.get('test/2').handler((req, res, next) => {
    res.send({})
  })
})