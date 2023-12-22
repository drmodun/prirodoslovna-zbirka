'use client';
import { Box, SimpleGrid } from '@chakra-ui/react';
import DevelopmentTable, {
  Indexable,
} from 'views/admin/dataTables/components/DevelopmentTable';
import React from 'react';
import { api } from 'types/base';
import { adminTableMappings } from 'types/responses';
import { QueryParamsForm } from 'components/queryParamsForm/queryParamsForm';
import Link from 'next/link';
import { Pagination } from 'components/pagination/pagination';

const getEntities = async (params: any, searchParams: any) => {
  try {
    if (!searchParams.page || !searchParams.size) {
      searchParams.page = 1;
      searchParams.size = 10;
    }
    const response = await api.get('/' + params.entity, {
      params: searchParams,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const DataTables = ({
  params,
  searchParams = {},
}: {
  params: any;
  searchParams?: any;
}) => {
  console.log(params);

  const handleParamsInit = (mapped: Indexable) => {
    const initSearchParams = {} as Indexable;
    Object.keys(mapped).forEach((key) => {
      initSearchParams[key] = searchParams[key] ?? mapped[key];
    });
    return initSearchParams;
  };
  const [items, setItems] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState<Indexable>(
    handleParamsInit(adminTableMappings[params.entity].query),
  );
  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(10);

  React.useEffect(() => {
    getEntities(params, searchParams).then((data) => {
      setItems(data);
    });
  }, [params, searchParams]);

  const handleParamsChange = (attribute: any, key: string) => {
    setSearch((prev) => ({ ...prev, [key]: attribute }));
  };

  const handleSearchObject = () => {
    const paramsObject = {} as Indexable;
    paramsObject.page = page;
    paramsObject.size = size;

    Object.keys(search).forEach((key) => {
      if (search[key] !== '' && search[key] !== undefined && search[key] !== -1)
        paramsObject[key] = search[key];
    });

    if (
      paramsObject.attribute == undefined &&
      paramsObject.direction != undefined
    )
      delete paramsObject.direction;

    return paramsObject;
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Pagination
        entity={params.entity}
        currentPage={page}
        onChange={setPage}
        searchParams={handleSearchObject()}
      />
      {items && (
        <DevelopmentTable
          tableData={items}
          title={params.entity}
          rows={adminTableMappings[params.entity].fields}
          links={adminTableMappings[params.entity].links}
        />
      )}
      <QueryParamsForm defaultData={search} handleChange={handleParamsChange} />
      <Link
        href={{
          pathname: `/admin/data-tables/${params.entity}`,
          query: handleSearchObject(),
        }}
      >
        Search
      </Link>
    </Box>
  );
};

export default DataTables;
