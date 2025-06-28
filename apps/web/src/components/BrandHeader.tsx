import React from 'react';
import NorthpointLogo from './NorthpointLogo';

const BrandHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-6">
      <NorthpointLogo className="h-12" />
    </div>
  );
};

export default BrandHeader;
