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

const AddVote = () => {

    // Client Viem
    const client = usePublicClient();

    // Input States
    const [voteAdded, setVoteAdded] = useState([]);

    // Events States
    const [VoteEvents, setVoteEvents] = useState([]);

    // IsLoading 
    const [isLoading, setIsLoading] = useState(false);

    // Toast
    const toast = useToast();

    // Account's informations
    const { address, isConnected } = useAccount();

    // registerVote Function
    const registerVote = async() => {
        try {

            setIsLoading(true)
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'setVote',
                args: [voteAdded],
            });
            const { hash } = await writeContract(request);
            setIsLoading(false)
            toast({
                title: 'Congratulations',
                description: "You have made your vote.",
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
            event: parseAbiItem('event Voted (address voter, uint proposalId);'),
            fromBlock: 0n,
            toBlock: 'latest'
        })

        setVoterRegisteredEvents(registeredLogs.map(
            log => ({
                addressVoter: log.args.voterAddress,
                proposalId: log.args.porposalId,
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
    }, [isLoading])

    return (
        <Flex p='2rem'>
            {isLoading 
            ? ( <Spinner /> ) 
            : ( isConnected ? (
                <Flex direction="column" width='100%'>
                    
                    <Heading as='h2' size='xl'>
                        Make your vote
                    </Heading>
                    
                    <Flex mt='1rem'>
                        <Input placeholder="Id of the proposal" value={voteAdded} onChange={(e) => setVoteAdded(e.target.value)} />
                        <Button colorScheme='green' onClick={voteAdded}>Vote</Button>
                    </Flex>

                    <Heading as='h2' size='xl' mt='2rem'>
                        Votes Events
                    </Heading>
                    <Flex mt='1rem' direction='column'>
                        {VoteEvents.length > 0 ? VoteEvents.map((event) => {
                            return <Flex key={crypto.randomUUID()}>
                                <Text>{event.addressVoter.substring(0,6)}...{event.addressVoter.substring(event.addressVoter.length - 5)} has voted</Text>
                            </Flex>
                        }) : <Text>No Votes Event</Text>}
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

export default AddVote;