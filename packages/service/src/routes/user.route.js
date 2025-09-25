const Router = require('@koa/router');
const router = new Router({prefix: '/api/users'});
const userCtrl = require('../controllers/user.ctrl');

router.get('/', userCtrl.list);
router.get('/:id', userCtrl.detail);
router.post('/', userCtrl.create);
router.post('/:id', userCtrl.update);
router.delete('/:id', userCtrl.remove);

module.exports = router;