import PackDetails from '../pages/PackDetails.page'
import Collection from '../pages/Collection.page'
import Moments from '../pages/Moments.page'
import Packs from '../pages/Packs.page'
import Home from '../pages/Home.page'

export const ROUTES = [
  { name: "Home", path: "/", component: Home, nav: true },
  { name: "Moments", path: "/moments", component: Moments, nav: true },
  { name: "Collection", path: '/collection', component: Collection, nav: true },
  { name: "Packs", path: '/packs', component: Packs, nav: true },
  { name: "PackDetails", path: '/packs/:packID', component: PackDetails, nav: false }

]

export const NAV_ROUTES = ROUTES.filter(r => r.nav)