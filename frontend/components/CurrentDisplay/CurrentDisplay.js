'use client'
import WorkflowButton from "@/components/WorkflowButton/WorkflowButton"
import Whitelist from "@/components/Whitelist/Whitelist"
import Proposals from "@/components/Proposals/Proposals"
import ProposalsTable from "@/components/ProposalsTable/ProposalsTable"
import AddVote from "@/components/AddVote/AddVote"
import VoteOver from "@/components/VoteOver/VoteOver"

import { Flex, Alert, AlertIcon, Heading, Input, Button, Text, useToast, Spinner } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '@/constants';

// ReactJS
import { useState, useEffect } from 'react';

const CurrentDisplay = () => {

    const [workflowStatus, setWorkflowStatus] = useState("0n")

    const [isOwner, setIsOwner] = useState(false);

    const [nbProposals, setNbProposals] = useState(0);

    const [wrkStatus, setWrkStatus] = useState(false);

    // Client Viem
    const client = usePublicClient();

    // Toast
    const toast = useToast();

    // Account's informations
    const { address, isConnected } = useAccount();

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
        }
    }

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
        }
    }

    useEffect(() => {
        const call = async() => {await getWorkflowStatus()};
        call();
    }, [wrkStatus])

    useEffect(() => {
        const call = async() => {await getIsOwner()};
        call();
    }, [address])

    function chosenComponent(workflowStatus) {
        switch (workflowStatus) {
            case "0":
                return (isOwner ? <Whitelist /> : <Text>Waiting for the owner to open the proposals registration session.</Text>);
            case "1":
                return (
                    <>
                        <Proposals setNbProposals={setNbProposals} />
                        <ProposalsTable nbProposals={nbProposals} />
                    </>
                );
            case "2":
                return (
                    <>
                        <Text>Proposals registering session is over. Waiting for the voting session to start.</Text>
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
                return <Text>Voting session is over. Waiting for the winner to be revealed.</Text>;
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