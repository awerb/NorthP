import React from 'react';
import NorthpointLogo from './NorthpointLogo';

const BrandHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-start py-4">
      <NorthpointLogo variant="full" size="md" />
    </div>
  );
};

export default BrandHeader;
