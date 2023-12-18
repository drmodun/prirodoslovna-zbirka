import { Box, Flex, Progress, Table, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue } from '@chakra-ui/react';
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable
} from '@tanstack/react-table';
// Custom components
import Card from 'components/card/Card';
import Menu from 'components/menu/MainMenu';
import { AndroidLogo, AppleLogo, WindowsLogo } from 'components/icons/Icons';
import * as React from 'react';
import { Type } from 'typescript';
import { AdminOrganisationResponseShort } from 'types/responses';
import { Link } from '@chakra-ui/next-js';
import { Interface } from 'readline';
// Assets

type Link = {
	label: string;
	link: string;
};

type Indexable = {
	[key: string]: any;
};

  

// const columns = columnsDataCheck;
export default function ComplexTable(props: { tableData: any, rows?: string[], title: string, links?: Link[] }) {
	const { tableData, rows, title, links } = props;
//	console.log(tableData, rows, columnHelper, props.tableData[0]);
	const [ sorting, setSorting ] = React.useState<SortingState>([]);
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const iconColor = useColorModeValue('secondaryGray.500', 'white');
	const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
	// let defaultData = tableData;
	// const columns = rows.map((row: string) => 
	// 	{ 
	// 	console.log(row);
	// 	const isLink = links?.find((link: Link) => link.label === row);
	// 	const helper = columnHelper.accessor("name", {
	// 		id: row,
	// 		header: () => (
	// 			<Text
	// 				justifyContent='space-between'
	// 				align='center'
	// 				fontSize={{ sm: '10px', lg: '12px' }}
	// 				color='gray.400'>
	// 				{row}
	// 			</Text>
	// 		),
	// 		cell: (info: any) => (
	// 			<Flex align='center'>
					
	// 				<Text color={textColor} fontSize='sm' fontWeight='700'>
	// 					{"attempt"}
	// 				</Text>
				
	// 			</Flex>
	// 		)
	// 	})
	// 	console.log(helper);
	// 	return helper;
	// }
	// );
	// const [ data, setData ] = React.useState(() => [ ...defaultData ]);
	// const table = useReactTable({
	// 	data,
	// 	columns,
	// 	state: {
	// 		sorting
	// 	},
	// 	onSortingChange: setSorting,
	// 	getCoreRowModel: getCoreRowModel(),
	// 	getSortedRowModel: getSortedRowModel(),
	// 	debugTable: true
	// });
	return (
		<Card flexDirection='column' w={"100%"}  minW='70vw' px='0px' overflowX={{ sm: 'scroll', lg: 'auto' }}>
			<Flex px='25px' mb="8px" justifyContent='space-between' align='center'>
				<Text color={textColor} fontSize='22px' fontWeight='700' lineHeight='100%'>
					{props.title}
				</Text>
				<Menu />
			</Flex>
			<Box>
				<Table variant='simple' color='gray.500' mb='24px' mt="12px">
					<Thead>
							<Tr>
								{rows.map((header) => {
									return (
										<Th
											key={header}
											pe='10px'
											borderColor={borderColor}
											cursor='pointer' >
											<Flex
												justifyContent='space-between'
												align='center'
												fontSize={{ sm: '10px', lg: '12px' }}
												color='gray.400'>
												<Text>{header}</Text>
											</Flex>
										</Th>
									);
								})}
							</Tr>
					</Thead>
					<Tbody>
						{tableData.map((row: any) => {
							return (
								<Tr key={row.id}>
									{rows.map((cell) => {
										const isLinked = links?.find((link: Link) => link.label === cell);
										return (
											<Td
												key={row.id + cell}
												fontSize={{ sm: '14px' }}
												minW={{ sm: '150px', md: '200px', lg: 'auto' }}
												borderColor='transparent'>
													{ isLinked ? ( 
													<Link href={"/" + title + "/" + row[isLinked.link]}> 
													<Text color={textColor} fontSize='sm' fontWeight='700'>
														{row[cell]}
													</Text>
													</Link>)
														 : (
													<Text color={textColor} fontSize='sm' fontWeight='700'>
														{row[cell]}
													</Text>)
													}
											</Td>
										);
									})}
								</Tr>
							);
						})}
					</Tbody>
				</Table>
			</Box>
		</Card>
	);
}
