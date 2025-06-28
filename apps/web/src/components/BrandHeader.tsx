import React from 'react';
import NorthpointLogo from './NorthpointLogo';

const BrandHeader: React.FC = () => {
  return (
    <div className="flex items-center">
      <NorthpointLogo className="h-10 w-auto" />
    </div>
  );
};

export default BrandHeader;
