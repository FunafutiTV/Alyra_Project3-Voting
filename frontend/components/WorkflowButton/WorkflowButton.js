'use client'

import { Flex, Alert, AlertIcon, Heading, Input, Button, Text, useToast, Spinner } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '@/constants';

// ReactJS
import { useState, useEffect } from 'react';

const WorkflowButton = ({ workflowStatus }) => {
    
    // IsLoading 
    const [isLoading, setIsLoading] = useState(false);

    // Account's informations
    const { address, isConnected } = useAccount();

    // Toast
    const toast = useToast();

    async function nextWorkflow(workflowStatus) {
        const chosenFunction = (workflowStatus) => {
            switch (workflowStatus) {
                case "0":
                    return 'startProposalsRegistration';
                case "1":
                    return 'endProposalsRegistration';
                case "2":
                    return 'startVotingSession';
                case "3":
                    return 'endVotingSession';
                case "4":
                    return 'votesTallied';
            }
        }
        try {
            setIsLoading(true)
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: chosenFunction(workflowStatus),
            });
            const { hash } = await writeContract(request);
            setIsLoading(false)
            toast({
                title: 'Congratulations',
                description: "Operation done with success.",
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

    function displayMessage(workflowStatus) {
        switch (workflowStatus) {
            case "0":
                return "Start proposals registration";
            case "1":
                return "End proposals registration";
            case "2":
                return "Start voting session";
            case "3":
                return "End voting session";
            case "4":
                return "Tally votes";
        }
    }

    return(
        <Flex p='2rem'>
            {isLoading ? <Spinner/> :
                ( isConnected ? (
                    workflowStatus === "5" ? 
                        <></> :
                        <Button colorScheme='green' onClick={() => {nextWorkflow(workflowStatus)}}>{displayMessage(workflowStatus)}</Button>
                ) : (
                    <Alert status='warning'>
                        <AlertIcon />
                        Please connect your Wallet to our DApp.
                    </Alert>
                ))
            }
        </Flex>
    )

}

export default WorkflowButton;