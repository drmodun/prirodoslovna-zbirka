'use client';

// Chakra imports
import {
  Box,
  Button,
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

export default function Upload(props: {
  used?: number;
  total?: number;
  type?: string;
  id?: string;
  [x: string]: any;
}) {
  const { used, total, type, id, ...rest } = props;
  // Chakra Color Mode
  const textColorPrimary = useColorModeValue('secondaryGray.900', 'white');
  const brandColor = useColorModeValue('#ff3333', 'red');
  const textColorSecondary = 'gray.400';

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

  return (
    <Card {...rest} mb="20px" alignItems="center" p="20px">
      <Flex h="100%" direction={{ base: 'column', '2xl': 'row' }}>
        <Dropzone
          w={{ base: '100%', '2xl': '268px' }}
          me="36px"
          maxH={{ base: '60%', lg: '50%', '2xl': '100%' }}
          minH={{ base: '60%', lg: '50%', '2xl': '100%' }}
          content={
            <Box>
              <Icon as={MdUpload} w="80px" h="80px" color={brandColor} />
              <Flex justify="center" mx="auto" mb="12px">
                <Text fontSize="xl" fontWeight="700" color={brandColor}>
                  Upload Files
                </Text>
              </Flex>
              <Text fontSize="sm" fontWeight="500" color="secondaryGray.500">
                PNG, JPG and GIF files are allowed
              </Text>
            </Box>
          }
        />
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
