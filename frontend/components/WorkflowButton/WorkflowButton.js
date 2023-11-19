'use client'

// ChakraUI
import { Flex, Alert, AlertIcon, Button, useToast, Spinner } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract } from '@wagmi/core';
import { useAccount } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '@/constants';

// ReactJS
import { useState } from 'react';

const WorkflowButton = ({ setWrkStatus, workflowStatus }) => {
    
    // State registering if the component is loading (a spinner will be displayed if it is)
    const [isLoading, setIsLoading] = useState(false);

    // Account's informations
    const { address, isConnected } = useAccount();

    // Toast
    const toast = useToast();

    // Function to call the appropriate function depending on the workflow status
    async function nextWorkflow(workflowStatus) {
        const chosenFunction = (workflowStatus) => {
            switch (workflowStatus) {
                case "0":
                    return 'startProposalsRegistering';
                case "1":
                    return 'endProposalsRegistering';
                case "2":
                    return 'startVotingSession';
                case "3":
                    return 'endVotingSession';
                case "4":
                    return 'tallyVotes';
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
            setWrkStatus(wrkStatus => !wrkStatus)
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

    // Function to display the right text on the button depending on the workflow status
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
                ( isConnected ? 
                        (workflowStatus === "5") ? 
                            <></> :
                            <Button colorScheme='blue' onClick={() => {nextWorkflow(workflowStatus)}}>{displayMessage(workflowStatus)}</Button>
                    : (
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