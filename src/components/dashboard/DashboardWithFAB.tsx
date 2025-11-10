import React from 'react';
import { MobileQuickAddFAB } from '../mobile/MobileQuickAddFAB';
import { useShowModal } from '../../context/ShowModalContext';

/**
 * DashboardWithFAB
 *
 * Wraps Dashboard with mobile Quick-Add FAB
 * Provides quick access to show/event/destination creation
 * Uses ShowModalContext for state management
 */

interface DashboardWithFABProps {
  children: React.ReactNode;
}

export const DashboardWithFAB: React.FC<DashboardWithFABProps> = ({
  children,
}) => {
  const { openAdd } = useShowModal();

  const handleAddShow = () => {
    openAdd();
  };

  const handleAddEvent = () => {
    // Could open event creation modal or navigate to event planning
    console.log('Add event clicked - to be implemented');
  };

  const handleAddDestination = () => {
    // Could open destination creation modal or navigate to travel planning
    console.log('Add destination clicked - to be implemented');
  };

  return (
    <>
      {/* Main dashboard content */}
      <div className="relative">
        {children}

        {/* Mobile Quick-Add FAB */}
        <MobileQuickAddFAB
          onAddShow={handleAddShow}
          onAddEvent={handleAddEvent}
          onAddDestination={handleAddDestination}
        />
      </div>
    </>
  );
};

export default DashboardWithFAB;
