import React from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps'

import {
    Box,
    Heading,
    SimpleGrid,
    Container,
    Input,
    InputRightElement,
    Button,
    InputGroup

    //useToast
} from "@chakra-ui/react";

import Poll from '../components/poll';
import Pollpopup from '../components/pollPopup';
import { getCol, getByPollName, getByQuestion, getByDescription } from '../lib/db.js';
import ProfileMarker from '../components/imgMarker';

/* const containerStyle = {
    width: '100%',
    height: '50vw'
}; */

/* const center = {
    lat: -3.745,
    lng: -38.523
}; */

export default function Discover() {

    const [markers, setMarkers] = React.useState(null);
    const [resultByPollName, setResultByPollName] = React.useState(null);
    const [inputQuery, setInputQuery] = React.useState(null);
    const [selectQuery, setSelectQuery] = React.useState("ByPollName");
    const [searchResult, setSearchResult] = React.useState(null);
    //const [location, setLocation] = React.useState([]);
    //const toast = useToast();

    React.useEffect(() => {

        async function fetchPolls() {
            setMarkers(await getCol("polls"));
        }
        async function getPollByName() {
            setResultByPollName(await getByPollName("polls", "t"));
        }

        fetchPolls();

        /*if (navigator.geolocation) { //check if geolocation is available
            await navigator.geolocation.getCurrentPosition(async function(pos){
                setLocation([pos.coords.latitude, pos.coords.longitude]);
            }, 
            function(error){
                setLoading(false);
                toast({
                    title: "Error",
                    description: "Location Data in-accessible or denied",
                    status: "error",
                    duration: 5000,
                    isClosable: true
                })
        
            })
        }*/
    }, []);

    const [post, setPost] = React.useState(null);
    const [showPopup, setShowPopup] = React.useState(false);
    const getProvider = (x, y, z) => `https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/${z}/${x}/${y}.png`;

    function handleClick(payload) {
        setPost(payload);
        setShowPopup(true);
    }

    function handleInputChange(e) {
        setInputQuery(e.target.value);
        
    }

    function handleSelectChange(e) {
        setSelectQuery(e.target.value);
        
    }

    async function GetSearchResult() {
        if (inputQuery !== null && selectQuery !== null) {
            if (selectQuery == "ByPollName") setSearchResult(await getByPollName("polls", inputQuery))
            else if (selectQuery == "ByQuestionName") setSearchResult(await getByQuestion("polls", inputQuery))
            else setSearchResult(await getByDescription("polls", inputQuery));
        }
    }

    
    if (markers) {
        return (
            <Box align="center">
                <Heading as="h1" m={12}>Discover</Heading>
                {showPopup && <Pollpopup set={setShowPopup} data={post} />}
                <div className='searchFeature'>
                    <select className="filter-dropdown" title='Sort By' onChange={handleSelectChange}>
                        <option value="ByPollName">By Poll Name</option>
                        <option value="ByQuestionName">By Question Name</option>
                        <option value="ByDescription">By Description</option>
                    </select>
                    <InputGroup size='md' width={300}>
                    <Input value={inputQuery}
                        placeholder='Search the polls' onChange={handleInputChange} />
                    <InputRightElement width='4.5rem'>
                        <Button h='2.3rem' size='sm' mr="1" onClick={GetSearchResult}>
                            Search
                        </Button>
                    </InputRightElement>
                    {/* <Button colorScheme='blue' h='2.3rem' size='md' mr="1" onClick={GetSearchResult}>
                            Search
                    </Button> */}
                    </InputGroup>
                </div>
                {searchResult != null ? <Container maxW="container.lg" mt={12}>
                    <Heading>Search Results</Heading>
                    <SimpleGrid p={8} columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                        {searchResult.slice(-8).map(result => <Poll /*pollvoting={true}*/ name={result.name} description={result.description} data={result} flag="discover" />)}
                    </SimpleGrid>
                </Container> : <> </>}
                {searchResult === null && inputQuery!== null && <div>No results found</div>}

                <Box w="90%" h="80vh" borderWidth="1px" borderRadius="lg" overflow="hidden">
                    <Map defaultCenter={[39.0831315, -77.2049467]} defaultZoom={12} width="100%" height="100%" provider={getProvider}>
                        {
                            markers.map(marker => <Marker anchor={[marker.location._lat, marker.location._long]} width={50} height={50} onClick={() => handleClick(marker)} />)
                        }
                        {
                            markers.map(marker =>
                                <Overlay anchor={[marker.location._lat, marker.location._long]} offset={[18, 54]} >
                                    <ProfileMarker marker={marker} set1={setPost} set2={setShowPopup} />
                                </Overlay>
                            )
                        }

                    </Map>
                </Box>

                <Container maxW="container.lg" mt={12}>
                    <Heading>Most Recent Polls</Heading>
                    <SimpleGrid p={8} columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                        {markers.slice(-8).map(marker => <Poll /*pollvoting={true}*/ name={marker.name} description={marker.description} data={marker} flag="discover" />)}
                    </SimpleGrid>
                </Container>
            </Box>
        )
    }
    else {
        return (
            <></>
        )
    }
}