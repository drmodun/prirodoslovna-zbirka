"use client"
import { Box, SimpleGrid } from '@chakra-ui/react';
import DevelopmentTable from 'views/admin/dataTables/components/DevelopmentTable';
import React from 'react';
import { api } from 'types/base';

const getEntities = async (params: any, searchParams: any ) => {
  try{
    if (!searchParams.page || !searchParams.size) {
      searchParams.page = 1;
      searchParams.size = 10;
    }
    const response = await api.get("/" + params.entity, {params: searchParams});
    return response.data;
  }
  catch(error){
    console.log(error);
  }
}

const DataTables = ({
  params, searchParams = {}
} : {
  params: any,
  searchParams?: any; }
) => {
  console.log(params);

  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    getEntities(params, searchParams).then((data) => {
      setItems(data);
    });
  }, [params, searchParams]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <SimpleGrid
        mb="20px"
        columns={{ sm: 1, md: 2 }}
        spacing={{ base: '20px', xl: '20px' }}
      >
{/*        <CheckTable tableData={tableDataCheck} />
        <ColumnsTable tableData={tableDataColumns} />
        <ComplexTable tableData={tableDataComplex} />
  */}
  {items && <DevelopmentTable 
  tableData={items}
  title={params.entity}
  rows={['name', 'description', 'role', 'createdAt', 'updatedAt']}
  links={[{label: 'name', link: 'id'}]}
  />}
  </SimpleGrid>
    </Box>
  );
}

export default DataTables;