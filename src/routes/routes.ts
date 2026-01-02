import { RouteNamesEnum } from 'localConstants';
import { Dashboard, Disclaimer, Home, Markets, MyBets, Wallet, Community, MarketDetails, CreateMarket, AdminDashboard, Roadmap } from 'pages';


import { RouteType } from 'types';

interface RouteWithTitleType extends RouteType {
  title: string;
}

export const routes: RouteWithTitleType[] = [
  {
    path: RouteNamesEnum.home,
    title: 'Home',
    component: Home
  },
  {
    path: RouteNamesEnum.dashboard,
    title: 'Dashboard',
    component: Dashboard
  },
  {
    path: RouteNamesEnum.markets,
    title: 'Markets',
    component: Markets
  },
  {
    path: RouteNamesEnum.myBets,
    title: 'My Bets',
    component: MyBets,
    authenticatedRoute: true
  },
  {
    path: RouteNamesEnum.wallet,
    title: 'Wallet',
    component: Wallet,
    authenticatedRoute: true
  },
  {
    path: RouteNamesEnum.createMarket,
    title: 'Create Market',
    component: CreateMarket,
    authenticatedRoute: true
  },
  {
    path: RouteNamesEnum.admin,
    title: 'Admin',
    component: AdminDashboard,
    authenticatedRoute: true
  },
  {
    path: RouteNamesEnum.community,
    title: 'Community',
    component: Community
  },
  {
    path: `${RouteNamesEnum.markets}/:id`,
    title: 'Market Details',
    component: MarketDetails
  },
  {
    path: RouteNamesEnum.roadmap,
    title: 'Roadmap',
    component: Roadmap
  },

  {
    path: RouteNamesEnum.disclaimer,
    title: 'Disclaimer',
    component: Disclaimer
  }
];


