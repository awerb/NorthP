import React from 'react';
import NorthpointLogo from './NorthpointLogo';

const FooterLogo: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-10 opacity-10">
      <NorthpointLogo className="h-8 w-auto" />
    </div>
  );
};

export default FooterLogo;
