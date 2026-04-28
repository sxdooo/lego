const Router = require('@koa/router');
const router = new Router({ prefix: '/api/travels' });
const travelCtrl = require('../controllers/travel.ctrl');

router.get('/', travelCtrl.list);
router.get('/:id', travelCtrl.detail);
router.post('/', travelCtrl.create);
router.put('/:id', travelCtrl.update);
router.delete('/:id', travelCtrl.remove);

module.exports = router;
