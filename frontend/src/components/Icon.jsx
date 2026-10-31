import React from 'react';
import * as Icons from 'lucide-react';

export const Icon = ({ name, className = 'w-5 h-5', ...props }) => {
  const IconComponent = Icons[name] || Icons.Package;
  return <IconComponent className={className} {...props} />;
};

export default Icon;
