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

import {
  Box,
  Flex,
  FormLabel,
  Image,
  Icon,
  Select,
  SimpleGrid,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
// Custom components
// import MiniCalendar from 'components/calendar/MiniCalendar';

export default function Default() {
  // Chakra Color Mode

  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const textColorSecondary = 'gray.400';

  return (
    <Box
      pt={{ base: '130px', md: '80px', xl: '80px' }}
      justifyContent={'center'}
      w={'100%'}
      alignItems={'center'}
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        w={'100%'}
        minW={'70vw'}
        borderRadius={'20px'}
        bgColor={boxBg}
        p="20px"
      >
        <Text fontSize="2xl" fontWeight="bold" mb="20px">
          Biosfera dashboard
        </Text>
        <Text
          fontSize="md"
          fontWeight="bold"
          mb="20px"
          color={textColorSecondary}
        >
          Ovo je glavni admin dashboard za platformu biosfere, ovu stranicu samo
          mogu vidjeti SuperAdmini stranice. Glavna poanta ove stranice je
          globalna administracija platforme sa mogucnosti trajnog brisanja i
          dozvoljavanja / brisanja sadrzaja user-generated contenta.
        </Text>
        <Text
          fontSize="md"
          fontWeight="bold"
          mb="20px"
          color={textColorSecondary}
        >
          Dashboard funkcionira na sljedeći način. Na sidebaru se nalaze glavni
          entiteti koji se nalaze an stranici (korisnici, organizacije,
          eksponati, postevi i organizacijski postevi), klikom na njih dlazite
          na specifcinu data-tables stranicu sa tablicom svih eksponata
          (paginacrini, pa 10 po 10). Ispod tablice imate specificnu formu koju
          mozete ispuniti za filtrirati i sortirati tablicu. Klikom na ime
          dolazite do glane single stanice za taj entiet, gdje se nalaze svi
          atributi entiteta.
        </Text>
        <Text
          fontSize="md"
          fontWeight="bold"
          mb="20px"
          color={textColorSecondary}
        >
          Na samome entitetu imate jos povezane entitete i mogucnost brisanja /
          mijenjanja dostupnosti nekoga entiteta. Trenutno nema mogucnosti
          sortiranja povezanih entiteta zbog strukture apija, ali to je podlezno
          promjeni
        </Text>
        <Text
          fontSize="md"
          fontWeight="bold"
          mb="20px"
          color={textColorSecondary}
        >
          U buducnosti ce mozda biti napravljena i edit / create forma za
          određene entitete, ali s obzirom na vrstu stranice i to da je u
          pravilu vecinom user-generated, ne vidim poantu to odma raditi
        </Text>
        <Text
          fontSize="md"
          fontWeight="bold"
          mb="20px"
          color={textColorSecondary}
        >
          Za bilo kakva pitanja, prijedloge ili zamjerke na stranicu ili
          dashboard, kao i sve bugove i probleme koji se mozda pojave, javite se
          bilo kojem od clanova trenutnog tima biosfere, primarno autoru ovog
          dashboarda (Jan Modun) ili (ako je stvar izgleda dashboarda ili se
          naknadno radi nesto novo na dahsboardu) autoru templatea (Simmmple)
        </Text>
      </Flex>
    </Box>
  );
}
