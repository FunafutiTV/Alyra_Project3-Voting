'use client'

// ChakraUI
import { Flex, Alert, AlertIcon, Heading, Input, Button, Text, useToast, Spinner } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '@/constants';

// ReactJS
import { useState, useEffect } from 'react';

// Viem
import { parseAbiItem } from 'viem';

const Proposals = () => {

    // Client Viem
    const client = usePublicClient();

    // Input State
    const [proposal, setProposal] = useState([]);

    // Events State
    const [ProposalRegisteredEvents, setProposalRegisteredEvents] = useState([]);

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
                functionName: 'addProposal',
                args: [proposal],
            });
            const { hash } = await writeContract(request);
            setIsLoading(false)
            toast({
                title: 'Congratulations',
                description: "Succesfully registered proposal.",
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
            event: parseAbiItem('event ProposalRegistered(uint proposalId)'),
            fromBlock: 0n,
            toBlock: 'latest'
        })
        setProposalRegisteredEvents(registeredLogs.map(
            log => ({
                IdProposal: log.args.proposalId.toString,
            })
        ));

        console.log("testProposals");
        console.log(registeredLogs);
    }   
    

    // Calling getEvents when loading is over
    useEffect(() => {
        const registerAndEvents = async() => {
            await getEvents()
        }
        registerAndEvents()
    }, [isLoading])

    /* array */
    return (
        <Flex p='2rem'>
            {isLoading 
            ? ( <Spinner /> ) 
            : ( isConnected ? (
                <Flex direction="column" width='100%'>
                    
                    <Heading as='h2' size='xl'>
                        Register a new proposal
                    </Heading>
                    
                    <Flex mt='1rem'>
                        <Input placeholder="Description of the proposal" value={proposal} onChange={(e) => setProposal(e.target.value)} />
                        <Button colorScheme='green' onClick={registerProposals}>Register a proposal</Button>
                    </Flex>

                    <Heading as='h2' size='xl' mt='2rem'>
                        Proposals Registration Events
                    </Heading>
                    <Flex mt='1rem' direction='column'>
                        {ProposalRegisteredEvents.length > 0 ? ProposalRegisteredEvents.map((event) => {
                            return <Flex key={crypto.randomUUID()}>
                                {/* <Text>{array[event.IdProposa.toString]} is registered as proposal with number {event.IdProposal.toString}</Text> */}
                            </Flex>
                        }) : <Text>No Proposals Registration Event</Text>}
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