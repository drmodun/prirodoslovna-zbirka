// Chakra imports
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import Card from 'components/card/Card';
import { NextAvatar } from 'components/image/Avatar';
import { adminTableMappings } from 'types/responses';
import { Indexable } from 'views/admin/dataTables/components/DevelopmentTable';

export default function Banner(props: { object: Indexable; type: string }) {
  const { object } = props;
  // Chakra Color Mode
  const textColorPrimary = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = 'gray.400';
  const borderColor = useColorModeValue(
    'white !important',
    '#111C44 !important',
  );
  return (
    <Card
      w={'100%'}
      minW={'70vw'}
      h={'auto'}
      mb={{ base: '0px', lg: '20px' }}
      alignItems="center"
    >
      <Flex w="100%" mx="auto" mt="26px" flexDirection={'column'}>
        {Object.keys(object).map((obj) => {
          const isObject = typeof object[obj] != 'object';
          const isLinkField =
            adminTableMappings[props.type].links.find(
              (link) => link.link === obj,
            ) != undefined;
          const isLink = adminTableMappings[props.type].links.find(
            (link) => link.label === obj,
          );
          return (
            isObject &&
            !isLinkField && (
              <Flex
                key={obj}
                w={'100%'}
                justifyContent={'space-between'}
                alignItems="center"
                flexDirection="row"
              >
                <Text color={textColorPrimary} fontSize="2xl" fontWeight="700">
                  {obj}
                </Text>
                {isLink ? (
                  <Text
                    color={textColorSecondary}
                    fontSize="sm"
                    fontWeight="400"
                  >
                    <a
                      href={`/admin/data-tables/${isLink.type}/${
                        object[isLink.link]
                      }`}
                    >
                      {object[obj]}
                    </a>
                  </Text>
                ) : (
                  <Text
                    color={textColorSecondary}
                    fontSize="sm"
                    fontWeight="400"
                  >
                    {object[obj]}
                  </Text>
                )}
              </Flex>
            )
          );
        })}
      </Flex>
    </Card>
  );
}
