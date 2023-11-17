'use client'

import { Flex, Alert, AlertIcon, Heading, Input, Button, Text, useToast, Spinner } from '@chakra-ui/react';

import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';

import { useState, useEffect } from 'react'

import { abi, contractAddress } from '@/constants';

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
            setWinner(data.toString())
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
            setWinnerDescription(data.description)
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
        <Flex p='2rem'>
                <Flex>
                    <Button colorScheme='green' onClick={getWinner}>Get winner</Button>
                </Flex>
                <Flex>
                    {hasClicked ? <Text>The winner is proposal {winner} : {winnerDescription}</Text>: <></>}
                </Flex>
        </Flex>
    )
}

export default VoteOver;