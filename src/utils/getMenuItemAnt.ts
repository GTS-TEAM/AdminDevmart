import { MenuItem } from 'shared/types';

export const getItem = (
   label: React.ReactNode,
   key?: React.Key | null,
   icon?: React.ReactNode,
   children?: MenuItem[]
): MenuItem => {
   return {
      key,
      icon,
      children,
      label,
   } as MenuItem;
};
