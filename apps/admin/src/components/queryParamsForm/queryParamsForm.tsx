'use client';

import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Icon,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { Indexable } from 'views/admin/dataTables/components/DevelopmentTable';

export const QueryParamsForm = ({
  handleChange,
  defaultData,
}: {
  handleChange: any;
  defaultData: Indexable;
}) => {
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';


  return (
    <FormControl
      width={'50%'}
      minW={'70vw'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      {Object.keys(defaultData).map((key, index) => (
        <>
          <FormLabel
            display="flex"
            ms="4px"
            width="100%"
            fontSize="sm"
            fontWeight="500"
            color={textColor}
            mb="8px"
          >
            {key}
          </FormLabel>
          <Input
            isRequired={true}
            variant="auth"
            fontSize="sm"
            value={defaultData[key]}
            defaultValue={defaultData[key]}
            _placeholder={{ color: textColorSecondary }}
            onChange={(e) => {
              handleChange(e.target.value, key);
            }}
            ms={{ base: '0px', md: '0px' }}
            placeholder="Enter value"
            mb="24px"
            fontWeight="500"
            size="lg"
          />
        </>
      ))}
    </FormControl>
  );
};
