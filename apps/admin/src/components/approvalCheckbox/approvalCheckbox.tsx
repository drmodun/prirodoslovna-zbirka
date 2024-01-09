'use client';

import { Checkbox } from '@chakra-ui/react';
import { useState } from 'react';
import { api } from 'types/base';

export const ApprovalCheckbox = ({
  isApproved,
  type,
  id,
}: {
  isApproved: boolean;
  type: string;
  id: string;
}) => {
  const [approved, setApproved] = useState(isApproved);

  const changeApprovalStatus = async () => {
    try {
      const response = await api.patch(`/${type}/${id}/approval`);
      if (response.status === 200) {
        setApproved((prev) => !prev);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Checkbox
      defaultChecked={approved}
      colorScheme="brandScheme"
      me="10px"
      onChange={changeApprovalStatus}
    />
  );
};
