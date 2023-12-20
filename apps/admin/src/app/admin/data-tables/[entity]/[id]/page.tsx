'use client';
/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2022 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// Chakra imports
import { Box, Grid } from '@chakra-ui/react';

// Custom components
import Banner from 'views/admin/profile/components/Banner';
import Upload from 'views/admin/profile/components/Upload';

// Assets
import { useEffect, useState } from 'react';
import { api } from 'types/base';
import ComplexTable, {
  Indexable,
} from 'views/admin/dataTables/components/DevelopmentTable';
import { adminTableMappings } from 'types/responses';

export default function ProfileOverview({
  params,
  searchParams,
}: {
  params: any;
  searchParams: any;
}) {
  const [item, setItem] = useState<Indexable>();
  const [formData, setFormData] = useState<Indexable>();

  const getItemInfo = async (params: any) => {
    try {
      const response = await api.get(`/${params.entity}/${params.id}`);
      setItem(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getItemInfo(params);
  }, [params]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [item]);

  //TODO: Add funfacts as list object here csv

  return (
    <Box
      pt={{ base: '130px', md: '80px', xl: '80px' }}
      flexDirection={'column'}
    >
      {item && <Banner type={params.entity} object={item} />}
      {params && item && (
        <Upload
          gridArea={{
            base: '3 / 1 / 4 / 2',
            lg: '1 / 3 / 2 / 4',
          }}
          minH={{ base: 'auto', lg: '420px', '2xl': '365px' }}
          pe="20px"
          pb={{ base: '100px', lg: '20px' }}
          id={params.id}
          isApproved={item?.isApproved}
          type={params.entity}
        />
      )}

      {item &&
        Object.keys(item).map((key) => {
          const isArray =
            Array.isArray(item[key]) && typeof item[key][0] != 'string';
          if (isArray)
            return (
              <ComplexTable
                tableData={item[key]}
                title={key}
                rows={adminTableMappings[key].fields}
                key={key}
                links={adminTableMappings[key].links}
              />
            );
        })}
    </Box>
  );
}