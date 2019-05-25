import * as React from 'react';
import AppsItem from '../AppsItem';

import { Item, Label } from './style';
import { AppsSection } from '../../models';

export default ({ data }: { data: AppsSection }) => {
  return (
    <Item>
      <Label>{data.label}</Label>
      {data.items.map(item => (
        <AppsItem key={item.id} data={item} />
      ))}
    </Item>
  );
};
