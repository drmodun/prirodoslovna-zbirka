import { Button, Flex, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { Indexable } from 'views/admin/dataTables/components/DevelopmentTable';

export const Pagination = ({
  currentPage,
  searchParams,
  onChange,
  entity,
}: {
  currentPage: number;
  searchParams: Indexable;
  onChange: any;
  entity: string;
}) => (
  <Flex w={'20%'} minW={'20vw'} alignContent={'center'} marginBottom={'20px'}>
    <Link
      href={{
        pathname: `/admin/data-tables/${entity}`,
        query: {
          ...searchParams,
          page: currentPage - 1,
        },
      }}
    >
      <Button
        onClick={() => {
          onChange((prev: number) => prev - 1);
        }}
      >
        {'<'}
      </Button>
    </Link>
    <Text
      w={'10%'}
      minW={'7.5vw'}
      textAlign={'center'}
      fontWeight={'bold'}
      fontSize={'lg'}
      padding={'5px'}
      alignContent={'center'}
    >
      {currentPage}
    </Text>
    <Link
      href={{
        pathname: `/admin/data-tables/${entity}`,
        query: {
          ...searchParams,
          page: currentPage + 1,
        },
      }}
    >
      <Button
        onClick={() => {
          onChange((prev: number) => prev + 1);
        }}
      >
        {'>'}
      </Button>
    </Link>
  </Flex>
);
