'use client'

// ChakraUI
import { Heading, useToast, Table, Thead, Tbody, Tr, Th, Td, TableCaption, TableContainer, Flex, Text, Spinner } from '@chakra-ui/react'

// Wagmi
import { readContract, getWalletClient } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '@/constants';

// Reactjs
import { useState, useEffect } from 'react';

// Viem
import { parseAbiItem } from 'viem';

const ProposalsTable = () => {

    // Account's informations
    const { address } = useAccount();

    // Client Viem
    const client = usePublicClient();

    // State that will register the number of proposals
    const [numberProposals, setNumberProposals] = useState(0);

    // Array that will contain all the proposals
    const [proposalsArray, setProposalsArray] = useState([]);

    // State registering if the component is loading (a spinner will be displayed if it is)
    const [isLoading, setIsLoading] = useState(true);

    // Toast
    const toast = useToast();

    // State that registers if the current address is the owner
    const [isVoter, setIsVoter] = useState(false);

    // Array that will contain the components for each proposal to display in the table
    const [proposalsComponents, setProposalsComponents] = useState([])

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

    // Push all the proposals in an array
    const pushProposal = async (i) => {
        const walletClient = await getWalletClient();
        try {
            if (!isLoading) {
                setProposalsArray([])
            }
            setIsLoading(true)
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: 'getOneProposal',
                args: [i],
                account: walletClient.account,

            })
            setProposalsArray((prevProposals) => [...prevProposals, data]);
            if (i === numberProposals) {
                setIsLoading(false)
            }
        }
        catch(err) {
            console.log(err.message)
        }
    }

    // Get all the proposals when the number of proposals changes
    useEffect(() => {
        for(let i = 1; i <= numberProposals; i++) {
            pushProposal(i);
        }
    }, [numberProposals])

    // Display all the proposals on the table
    useEffect(() => {
        console.log(proposalsArray)
        if (!isLoading) {
            setProposalsComponents([])
            for(let i = 0; i < numberProposals; i++) {   
                setProposalsComponents((prevComponents) => [...prevComponents, (
                    <Tr key={i + 1}>
                        <Td>{i + 1}</Td>
                        <Td>{proposalsArray[i].description}</Td>
                    </Tr>
                )])
            }
        }
    }, [isLoading])

    // Getting number of proposals (used to bound the for loop)
    useEffect(() => {
        const getEvents = async() => {
            const registeredLogs = await client.getLogs({  
                address: contractAddress,
                event: parseAbiItem('event ProposalRegistered(uint proposalId)'),
                // fromBlock :0n,                
                fromBlock: BigInt(Number(await client.getBlockNumber()) - 15000),
                toBlock: 'latest'
            })
            setNumberProposals(registeredLogs.length);
        }
        getEvents();
    }, [])

    // Whenever an account change is detected, verify if the address is a voter
    useEffect(() => {
        const call = async() => {await getIsVoter()};
        call();
    }, [address])

    return(
        <>
            {isVoter ? 
            <Flex p='2rem'>
                {(numberProposals !== 0) ? 
                    <>
                        {isLoading 
                        ? ( <Spinner /> ) : 
                        <TableContainer>
                            <Table variant='simple' border="2px solid rgba(0,0,0,0.4)">
                                <TableCaption>Proposals List</TableCaption>
                                <Thead>
                                    <Tr>
                                        <Th>Proposal ID</Th>
                                        <Th>Description</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {proposalsComponents}
                                </Tbody>
                            </Table>
                        </TableContainer>
                }</> : <Text>No proposals yet.</Text>
                }
            </Flex>
            : <Heading as="h2" fontSize="1.2rem" marginLeft="2rem" marginTop="2rem">Only voters can access this.</Heading>
            }
        </>
    )
}

export default ProposalsTable;