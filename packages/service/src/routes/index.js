const userRoute = require('./user.route');
// const postRoute = require('./post.route');

module.exports = (app) => {
  app.use(userRoute.routes()).use(userRoute.allowedMethods());
//   app.use(postRoute.routes()).use(postRoute.allowedMethods());
};