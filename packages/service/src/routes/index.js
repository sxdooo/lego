const userRoute = require('./user.route');
const pageRoute = require('./page.route');
const travelRoute = require('./travel.route');
// const postRoute = require('./post.route');

module.exports = (app) => {
  app
    .use(userRoute.routes())
    .use(userRoute.allowedMethods())
    .use(pageRoute.routes())
    .use(pageRoute.allowedMethods())
    .use(travelRoute.routes())
    .use(travelRoute.allowedMethods());
//   app.use(postRoute.routes()).use(postRoute.allowedMethods());
};