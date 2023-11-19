'use client'

// ChakraUI
import { Flex, Button, useToast, Heading } from '@chakra-ui/react';

// Wagmi
import { readContract, getWalletClient } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

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

    // wrkStatus
    const [wrkStatus, setWrkStatus] = useState(false)      
    
    // isOwner
    const [isOwner, setIsOwner] = useState(false);

    // isVoter
    const [isVoter, setIsVoter] = useState(false);

        
    // Account's informations
    const { address, isConnected } = useAccount();

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

        // Verify is user is a voter
        const getIsVoter = async () => {
           const walletClient = await getWalletClient();
           try {
               const data = await readContract({
                   address: contractAddress,
                   abi: abi,
                   functionName: "getVoter",
                   args: [address],
                   account: walletClient.account,
               });
           
               setIsVoter(data.isRegistered);
           } 
           catch (err) {
               console.log(err);
               setIsVoter(false);
           }
        }
    
    // Verify if user is the owner of the contract or a voter whenever the user address changes
    useEffect(() => {
        const call = async() => {await getIsOwner()};
        call();
    }, [address])
    useEffect(() => {
        const call = async() => {await getIsVoter()};
        call();
    }, [address])

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
                    {hasClicked ?  isVoter ?
                        // 
                        <Heading as="h2" fontSize="1.2rem" marginTop="2rem">The winner is proposal {winner} : {winnerDescription}</Heading>   
                        : isOwner && winnerDescription ?
                            <Heading as="h2" fontSize="1.2rem" marginTop="2rem">The winner is proposal number {winner}</Heading> 
                            : <></>
                    : <></>
                    }
                </Flex>
        </Flex>
    )
}

export default VoteOver;