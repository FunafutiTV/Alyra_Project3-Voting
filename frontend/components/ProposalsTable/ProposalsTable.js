'use client'

// ChakraUI
import { Table, Thead, Tbody, Tr, Th, Td, TableCaption, TableContainer, Flex, Text, Spinner } from '@chakra-ui/react'

// Wagmi
import { readContract } from '@wagmi/core';
import { usePublicClient } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '@/constants';

// Reactjs
import { useState, useEffect } from 'react';

// Viem
import { parseAbiItem } from 'viem';

const ProposalsTable = () => {

    // Client Viem
    const client = usePublicClient();

    // numberProposals
    const [numberProposals, setNumberProposals] = useState(0);

    // proposalsArray
    const [proposalsArray, setProposalsArray] = useState([]);

    // isLoading
    const [isLoading, setIsLoading] = useState(true);

    // proposalsComponents
    const [proposalsComponents, setProposalsComponents] = useState([])

    // Push all the proposals in an array
    const pushProposal = async (i) => {
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
                fromBlock: 0n,
                toBlock: 'latest'
            })
            setNumberProposals(registeredLogs.length);
        }
        getEvents();
    }, [])

    return(
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
    )
}

export default ProposalsTable;