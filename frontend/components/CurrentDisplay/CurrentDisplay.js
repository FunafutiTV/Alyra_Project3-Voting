'use client'

// Components
import WorkflowButton from "@/components/WorkflowButton/WorkflowButton"
import Whitelist from "@/components/Whitelist/Whitelist"
import Proposals from "@/components/Proposals/Proposals"
import ProposalsTable from "@/components/ProposalsTable/ProposalsTable"
import AddVote from "@/components/AddVote/AddVote"
import VoteOver from "@/components/VoteOver/VoteOver"

// ChakraUI
import { Alert, AlertIcon, Heading, useToast } from '@chakra-ui/react';

// Wagmi
import { readContract } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '@/constants';

// ReactJS
import { useState, useEffect } from 'react';

const CurrentDisplay = () => {

    // workflowStatus
    const [workflowStatus, setWorkflowStatus] = useState("0n")

    // isOwner
    const [isOwner, setIsOwner] = useState(false);

    // State that will get the workflow status from the workflowButton component
    const [wrkStatus, setWrkStatus] = useState(false);

    // Client Viem
    const client = usePublicClient();

    // Toast
    const toast = useToast();

    // Account's informations
    const { address, isConnected } = useAccount();

    // Get workflow status from contract
    const getWorkflowStatus = async() => {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: 'workflowStatus',
            })
            setWorkflowStatus(data)
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
    }

    // Verify is user is the owner of the contract
    const getIsOwner = async() => {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: 'owner',
            })
            setIsOwner((data === address))
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
    }

    // Call getWorkflowStatus when workflow status changes in WorkflowButton component
    useEffect(() => {
        const call = async() => {await getWorkflowStatus()};
        call();
    }, [wrkStatus])

    // Verify if user is the owner of the contract whenever the user address changes
    useEffect(() => {
        const call = async() => {await getIsOwner()};
        call();
    }, [address])

    // Choose the right component to display depending on the workflow status
    function chosenComponent(workflowStatus) {
        switch (workflowStatus) {
            case "0":
                return (isOwner ? <Whitelist /> : <Heading as="h2" fontSize="1.2rem" marginLeft="2rem" marginTop="2rem">Waiting for the owner to open the proposals registration session.</Heading>);
            case "1":
                return (
                    <>
                        <Proposals />
                    </>
                );
            case "2":
                return (
                    <>
                        <Heading as="h2" fontSize="1.2rem" marginLeft="2rem" marginTop="2rem">Proposals registering session is over. Waiting for the voting session to start.</Heading>
                        <ProposalsTable />
                    </>
                );
            case "3":
                return (
                    <>
                        <AddVote />
                        <ProposalsTable />
                    </>
                );
            case "4":
                return <Heading as="h2" fontSize="1.2rem" marginLeft="2rem" marginTop="2rem">Voting session is over. Waiting for the winner to be revealed.</Heading>;
            case "5":
                return <VoteOver />;
        }
    }

    return (
        <>
            {isConnected 
                ? <>
                    <>{chosenComponent(workflowStatus.toString())}</>
                    {isOwner ? (<WorkflowButton setWrkStatus={setWrkStatus} workflowStatus={workflowStatus.toString()} />) : ""}
                  </>
                : (
                    <Alert status='warning'>
                        <AlertIcon />
                        Please connect your Wallet to our DApp.
                    </Alert>
                )}
        </>
    )
}

export default CurrentDisplay;