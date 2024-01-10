import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
  MdPostAdd,
  MdBiotech,
  MdAnnouncement,
} from 'react-icons/md';

// Admin Imports
// import MainDashboard from './pages/admin/default';
// import NFTMarketplace from './pages/admin/nft-marketplace';
// import Profile from './pages/admin/profile';
// import DataTables from './pages/admin/data-tables';
// import RTL from './pages/rtl/rtl-default';

// Auth Imports
// import SignInCentered from './pages/auth/sign-in';
import { IRoute } from 'types/navigation';

const routes: IRoute[] = [
  {
    name: 'Homepage',
    layout: '/admin',
    path: '',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  },
  // {
  //   name: 'NFT Marketplace',
  //   layout: '/admin',
  //   path: '/nft-marketplace',
  //   icon: (
  //     <Icon
  //       as={MdOutlineShoppingCart}
  //       width="20px"
  //       height="20px"
  //       color="inherit"
  //     />
  //   ),
  //   secondary: true,
  // },
  // {
  //   name: 'Data Tables',
  //   layout: '/admin',
  //   icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
  //   path: '/data-tables',
  // },
  {
    name: 'Users',
    layout: '/admin',
    path: '/data-tables/users',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Organisations',
    layout: '/admin',
    path: '/data-tables/organisations',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Exponats',
    layout: '/admin',
    path: '/data-tables/exponats',
    icon: <Icon as={MdBiotech} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Posts',
    layout: '/admin',
    path: '/data-tables/posts',
    icon: <Icon as={MdPostAdd} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Social (organisation) posts',
    layout: '/admin',
    path: '/data-tables/social-posts',
    icon: <Icon as={MdAnnouncement} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
  },
];

export default routes;