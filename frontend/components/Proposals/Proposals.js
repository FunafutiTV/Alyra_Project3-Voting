'use client'

// ChakraUI
import { Flex, Alert, AlertIcon, Heading, Input, Button, useToast, Spinner } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '@/constants';

// ReactJS
import { useState } from 'react';

const Proposals = () => {

    // Client Viem
    const client = usePublicClient();

    // Input State
    const [proposal, setProposal] = useState([]);

    // IsLoading 
    const [isLoading, setIsLoading] = useState(false);

    // Toast
    const toast = useToast();

    // Account's informations
    const { isConnected } = useAccount();

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