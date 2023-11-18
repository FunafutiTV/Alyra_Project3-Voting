'use client'

// ChakraUI
import { Flex, Button, useToast, Heading } from '@chakra-ui/react';

// Wagmi
import { readContract, getWalletClient } from '@wagmi/core';

// ReactJS
import { useState, useEffect } from 'react'

// Contracts informations
import { abi, contractAddress } from '@/constants';

const VoteOver = () => {

    // hasClicked
    const [hasClicked, setHasClicked] = useState(false);

    // winner
    const [winner, setWinner] = useState(0);

    // winnerDescription
    const [winnerDescription, setWinnerDescription] = useState("");

    // Toast
    const toast = useToast();

    // Get winning proposal ID
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
            toast({
                title: 'Error',
                description: "An error occured.",
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
        }
    }

    // Get winning proposal description
    const getDescription = async() => {
        const walletClient = await getWalletClient();
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: 'getOneProposal',
                args: [winner],
                account: walletClient.account,
            })
            setWinnerDescription(data.description)
        }
        catch(err) {
            console.log(err.message)
        }
    }

    // Get proposals description when winning proposal ID is retrieved
    useEffect(() => {
        const call = async() => {await getDescription()}
        call();
    }, [winner])

    return(
        <Flex p='2rem' flexDirection="column">
                <Flex>
                    <Button colorScheme='green' onClick={getWinner}>Get winner</Button>
                </Flex>
                <Flex>
                    {hasClicked ? 
                        winnerDescription ?
                            <Heading as="h2" fontSize="1.2rem" marginTop="2rem">The winner is proposal {winner} : {winnerDescription}</Heading>
                        : <Heading as="h2" fontSize="1.2rem" marginTop="2rem">The winner is proposal number {winner}</Heading> 
                    : <></>
                    }
                </Flex>
        </Flex>
    )
}

export default VoteOver;