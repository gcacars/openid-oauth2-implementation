import Router from 'koa-router';
import httpKoaContext from '../context/httpKoaContext';
import { listLogs } from '../controllers';

const router = new Router({ prefix: '/ui' });
router.get('/:system', httpKoaContext(listLogs));

export default router;
