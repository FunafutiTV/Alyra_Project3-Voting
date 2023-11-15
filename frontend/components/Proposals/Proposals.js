'use client'

import { Flex, Alert, AlertIcon, Heading, Input, Button, Text, useToast, Spinner } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '@/constants';

// ReactJS
import { useState, useEffect } from 'react';

// Viem
import { formatEther, parseEther, createPublicClient, http, parseAbiItem } from 'viem';
import { hardhat } from 'viem/chains';

const Proposals = () => {

    // Client Viem
    const client = usePublicClient();

    // Input States
    const [proposals, setProposals] = useState([]);

    // Events States
    const [VoterRegisteredEvents, setVoterRegisteredEvents] = useState([]);

    // IsLoading 
    const [isLoading, setIsLoading] = useState(false);

    // Toast
    const toast = useToast();

    // Account's informations
    const { address, isConnected } = useAccount();

    // registerProposals Function
    const registerProposals = async() => {
        try {

            setIsLoading(true)
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'registerProposals',
                args: [addressWhitelisted],
            });
            const { hash } = await writeContract(request);
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
            toast({
                title: 'Error',
                description: "An error occured.",
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
        }  
    };

    // Get the event with Viem

    const getEvents = async() => {
        // Registered
        const registeredLogs = await client.getLogs({  
            address: contractAddress,
            event: parseAbiItem('event VoterRegistered(address voterAddress)'),
            fromBlock: 0n,
            toBlock: 'latest'
        })

        setVoterRegisteredEvents(registeredLogs.map(
            log => ({
                addressVoter: log.args.voterAddress,
            })
        ));

        console.log("test");
        console.log(registeredLogs);
    }   
    
    useEffect(() => {
        const registerAndEvents = async() => {
            await getEvents()
        }
        registerAndEvents()
    }, [addressWhitelisted])

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
                        <Button colorScheme='green' onClick={addVoter}>Register</Button>
                    </Flex>

                    <Heading as='h2' size='xl' mt='2rem'>
                        Registering Events
                    </Heading>
                    <Flex mt='1rem' direction='column'>
                        {VoterRegisteredEvents.length > 0 ? VoterRegisteredEvents.map((event) => {
                            return <Flex key={crypto.randomUUID()}>
                                <Text>{event.addressVoter.substring(0,6)}...{event.addressVoter.substring(event.addressVoter.length - 5)} whitelisted</Text>
                            </Flex>
                        }) : <Text>No Registering Event</Text>}
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

export default Proposals;