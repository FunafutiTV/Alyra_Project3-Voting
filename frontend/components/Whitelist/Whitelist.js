'use client'

// ChakraUI
import { Flex, Alert, AlertIcon, Heading, Input, Button, Text, useToast, Spinner } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '@/constants';

// ReactJS
import { useState, useEffect } from 'react';

// Viem
import { parseAbiItem } from 'viem';

const Whitelist = () => {

    // Client Viem
    const client = usePublicClient();

    // Input State
    const [addressWhitelisted, setAddressWhitelisted] = useState(0);

    // Events State
    const [VoterRegisteredEvents, setVoterRegisteredEvents] = useState([]);

    // State registering if the component is loading (a spinner will be displayed if it is)
    const [isLoading, setIsLoading] = useState(false);

    // Toast
    const toast = useToast();

    // Account's informations
    const { address, isConnected } = useAccount();

    // Function to add a voter to the whitelist
    const addVoter = async() => {
        try {

            setIsLoading(true)
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'addVoter',
                args: [addressWhitelisted],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            setIsLoading(false)
            toast({
                title: 'Congratulations',
                description: "You have whitelisted a voter.",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
        }
        catch(err) {
            console.log(err.message)
            setIsLoading(false)
            toast({
                title: 'Error',
                description: "An error occured.",
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
        }  
    };

    // Get events with Viem
    const getEvents = async() => {
        const registeredLogs = await client.getLogs({  
            address: contractAddress,
            event: parseAbiItem('event VoterRegistered(address voterAddress)'),
            fromBlock :0n,            
            // fromBlock: BigInt(Number(await client.getBlockNumber()) - 15000),
            toBlock: 'latest'
        })

        setVoterRegisteredEvents(registeredLogs.map(
            log => ({
                addressVoter: log.args.voterAddress,
            })
        ));
    }   

    // Calling getEvents when loading is over
    useEffect(() => {
        const registerAndEvents = async() => {
            await getEvents()
        }
        registerAndEvents()
    }, [isLoading])

    return (
        <Flex p='2rem'>
            {isLoading 
            ? ( <Spinner /> ) 
            : ( isConnected ? (
                <Flex direction="column" width='100%'>
                    
                    <Heading as='h2' size='xl'>
                        Register a voter to the whitelist
                    </Heading>
                    
                    <Flex mt='1rem'>
                        <Input placeholder="Address of the voter" value={addressWhitelisted} onChange={(e) => setAddressWhitelisted(e.target.value)} />
                        <Button colorScheme='green' onClick={addVoter}>Register a voter</Button>
                    </Flex>

                    <Heading as='h2' size='xl' mt='2rem'>
                        Whitelist Registration Events
                    </Heading>
                    <Flex mt='1rem' direction='column'>
                        {VoterRegisteredEvents.length > 0 ? VoterRegisteredEvents.map((event) => {
                            return <Flex key={crypto.randomUUID()}>
                                <Text>{event.addressVoter.substring(0,6)}...{event.addressVoter.substring(event.addressVoter.length - 5)} whitelisted</Text>
                            </Flex>
                        }) : <Text>No Registering Whitelist Event</Text>}
                    </Flex>
                </Flex>
            ) : (
                <Alert status='warning'>
                    <AlertIcon />
                    Please connect your Wallet to our DApp.
                </Alert>
            )) }
        </Flex>
    )
};

export default Whitelist;