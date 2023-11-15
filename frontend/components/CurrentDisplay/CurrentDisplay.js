'use client'
import WorkflowButton from "@/components/WorkflowButton/WorkflowButton"
import Whitelist from "@/components/Whitelist/Whitelist"
import Proposals from "@/components/Proposals/Proposals"
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
    }, [])

    useEffect(() => {
        const call = async() => {await getIsOwner()};
        call();
    }, [address])

    function chosenComponent(workflowStatus) {
        console.log(workflowStatus)
        switch (workflowStatus) {
            case "0":
                return (isOwner ? <Whitelist /> : <Text>Waiting for the owner to open the proposals registration session.</Text>);
            case "1":
                return <Proposals proposalsOpen={true} voteOpen={false} />;
            case "2":
                return <Proposals proposalsOpen={false} voteOpen={false} />;
            case "3":
                return <Proposals proposalsOpen={false} voteOpen={true} />;
            case "4":
                return <Proposals proposalsOpen={true} voteOpen={false} />;
            case "5":
                return <VoteOver />;
        }
    }

    return (
        <>
            {isConnected 
                ? <>
                    <>{chosenComponent(workflowStatus.toString())}</>
                    {isOwner ? (<WorkflowButton workflowStatus={workflowStatus.toString()} />) : ""}
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