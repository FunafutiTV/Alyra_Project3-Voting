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

const Proposals = ({ setNbProposals }) => {

    // Client Viem
    const client = usePublicClient();

    // Input States
    const [proposal, setProposal] = useState([]);

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
            event: parseAbiItem('event ProposalRegistered(uint proposalId)'),
            fromBlock: 0n,
            toBlock: 'latest'
        })
        setNbProposals(registeredLogs.length);
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
                        Register a new proposal
                    </Heading>
                    
                    <Flex mt='1rem'>
                        <Input placeholder="Description of the proposal" value={proposal} onChange={(e) => setProposal(e.target.value)} />
                        <Button colorScheme='green' onClick={registerProposals}>Register</Button>
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