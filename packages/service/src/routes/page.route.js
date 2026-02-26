const Router = require('@koa/router');
const router = new Router({ prefix: '/api/pages' });
const pageCtrl = require('../controllers/page.ctrl');

router.get('/', pageCtrl.list);
router.get('/:id', pageCtrl.detail);
router.post('/', pageCtrl.create);
router.put('/:id', pageCtrl.update);

module.exports = router;

