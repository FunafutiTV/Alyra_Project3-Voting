'use client'

import { Flex, Alert, AlertIcon, Heading, Input, Button, Text, useToast, Spinner } from '@chakra-ui/react';

import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';

import { useState, useEffect } from 'react'

const VoteOver = () => {

    const [hasClicked, setHasClicked] = useState(false);
    const [winner, setWinner] = useState(0);
    const [winnerDescription, setWinnerDescription] = useState("");

    const getWinner = async() => {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: 'winningProposalID',
            })
            setWinner(data)
            setHasClicked(true)
        }
        catch(err) {
            console.log(err.message)
        }
    }

    const getDescription = async() => {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: 'getOneProposal',
                args: [winner],
            })
            setWinnerDescription(data)
        }
        catch(err) {
            console.log(err.message)
        }
    }

    useEffect(() => {
        const call = async() => {await getDescription()}
        call();
    }, [winner])

    return(
        <>
            <Button colorScheme='green' onClick={getWinner}>Get winner</Button>
            {hasClicked ? <Text>The winner is proposal {winner}, : {winnerDescription}</Text>: <></>}
        </>
    )
}

export default VoteOver;