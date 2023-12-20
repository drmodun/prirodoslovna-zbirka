'use client';

// Chakra imports
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
// Custom components
import Card from 'components/card/Card';
// Assets
import { MdUpload } from 'react-icons/md';
import Dropzone from 'views/admin/profile/components/Dropzone';
import { api } from '../../../../types/base';
import { useState } from 'react';

export default function Upload(props: {
  used?: number;
  total?: number;
  type?: string;
  id?: string;
  isApproved?: boolean;
  [x: string]: any;
}) {
  const { used, total, type, id, isApproved, ...rest } = props;
  // Chakra Color Mode
  const textColorPrimary = useColorModeValue('secondaryGray.900', 'white');
  const brandColor = useColorModeValue('#ff3333', 'red');
  const textColorSecondary = 'gray.400';

  const [approved, setApproved] = useState(isApproved);

  const deleteEntity = async () => {
    const confirmationDialog = confirmation();
    if (confirmationDialog) {
      try {
        const response = await api.delete(`/${type}/${id}`);
        if (response.status === 200) {
          alert('Entity deleted');
          window.location.href = `/admin/data-tables/${type}`;
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const confirmation = () => {
    const confirmationDialog = confirm(
      'Are you sure you want to delete this entity?',
    );
    return confirmationDialog;
  };

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
    <Card {...rest} mb="20px" alignItems="center" p="20px">
      <Flex h="100%" direction={{ base: 'column', '2xl': 'row' }}>
        <Flex direction="column">
          <Text
            color={textColorPrimary}
            fontWeight="bold"
            textAlign="start"
            fontSize="2xl"
            mt={{ base: '20px', '2xl': '50px' }}
          >
            Complete your profile
          </Text>
          <Text
            color={textColorSecondary}
            fontSize="md"
            my={{ base: 'auto', '2xl': '10px' }}
            mx="auto"
            textAlign="start"
          >
            Stay on the pulse of distributed projects with an anline whiteboard
            to plan, coordinate and discuss
          </Text>
          {isApproved !== undefined && (
            <Flex
              direction="row"
              my={{ base: 'auto', '2xl': '20px' }}
              mx="auto"
              w={'100%'}
              justifyContent={'space-between'}
              textAlign="start"
            >
              <Checkbox
                defaultChecked={approved}
                colorScheme="brandScheme"
                me="10px"
                onChange={changeApprovalStatus}
              />
              <Text
                color={textColorSecondary}
                fontSize="md"
                my={{ base: 'auto', '2xl': '10px' }}
                mx="auto"
                textAlign="start"
              >
                Approval status
              </Text>
            </Flex>
          )}
          <Flex w="100%" justifyContent={'center'} alignItems={'center'}>
            <Button
              w="70%"
              minW="20vw"
              mt={{ base: '20px', '2xl': 'auto' }}
              bgColor={brandColor}
              fontWeight="500"
              onClick={deleteEntity}
            >
              Delete now
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
