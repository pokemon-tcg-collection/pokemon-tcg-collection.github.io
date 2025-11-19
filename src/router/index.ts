import { createRouter, createWebHistory } from 'vue-router'

import { beforeEachCheckValidObjectIDs } from './guards'
import routes from './routes'
import { afterEachUpdatePageTitle } from './titles'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

router.beforeEach(beforeEachCheckValidObjectIDs)
router.afterEach(afterEachUpdatePageTitle)

export default router
