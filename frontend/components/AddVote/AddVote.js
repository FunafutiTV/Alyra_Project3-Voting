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

const AddVote = () => {

    // Client Viem
    const client = usePublicClient();

    // Input States
    const [voteAdded, setVoteAdded] = useState([]);

    // Events States
    const [VoteEvents, setVoteEvents] = useState([]);

    // State registering if the component is loading (a spinner will be displayed if it is)
    const [isLoading, setIsLoading] = useState(false);

    // Toast
    const toast = useToast();

    // Account's informations
    const { address, isConnected } = useAccount();

    // Function to register a voter
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
            const data = await waitForTransaction({
                hash: hash,
            })
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
            event: parseAbiItem('event Voted(address voter, uint proposalId)'),
            fromBlock :0n,
            // fromBlock: BigInt(Number(await client.getBlockNumber()) - 15000),
            toBlock: 'latest'
        })

        setVoteEvents(registeredLogs.map(
            log => ({
                addressVoter: log.args.voter,
                proposalId: log.args.proposalId,
            })
        ));
    }   
    
    // Get events when loading is over
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
                        Register your vote
                    </Heading>
                    
                    <Flex mt='1rem'>
                        <Input placeholder="Id of the proposal" value={voteAdded} onChange={(e) => setVoteAdded(e.target.value)} />
                        <Button colorScheme='green' onClick={registerVote}>Vote</Button>
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