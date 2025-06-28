import React from 'react';
import NorthpointLogo from './NorthpointLogo';

const BrandHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-start py-2">
      <NorthpointLogo variant="full" size="sm" />
    </div>
  );
};

export default BrandHeader;
