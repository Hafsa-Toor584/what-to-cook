import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import HelpMeDecideFAB from './HelpMeDecideFAB';

export default function Layout() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-28 pt-0">
      <Outlet />
      <HelpMeDecideFAB />
      <BottomNav />
    </div>
  );
}
