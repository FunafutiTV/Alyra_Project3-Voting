'use client'
import { Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer, Flex, Alert, AlertIcon, Heading, Input, Button, Text, useToast, Spinner } from '@chakra-ui/react'

import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

import { abi, contractAddress } from '@/constants';

import { useState, useEffect } from 'react';

import { formatEther, parseEther, createPublicClient, http, parseAbiItem } from 'viem';

const ProposalsTable = ({ nbProposals }) => {

    const client = usePublicClient();

    const [numberProposals, setNumberProposals] = useState(0);

    const [proposalsArray, setProposalsArray] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const [proposalsComponents, setProposalsComponents] = useState([])

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

    useEffect(() => {
        for(let i = 1; i <= numberProposals; i++) {
            pushProposal(i);
        }
    }, [numberProposals])

    useEffect(() => {
        console.log(proposalsArray)
        if (!isLoading) {
            setProposalsComponents([])
            for(let i = 0; i < numberProposals; i++) {   
                setProposalsComponents((prevComponents) => [...prevComponents, (
                    <Tr key={i}>
                        <Td>{i}</Td>
                        <Td>{proposalsArray[i].description}</Td>
                        <Td>{proposalsArray[i].voteCount.toString()}</Td>
                    </Tr>
                )])
            }
        }
    }, [isLoading])

    useEffect(() => {
        if (nbProposals === undefined) {
            const getEvents = async() => {
                // Registered
                const registeredLogs = await client.getLogs({  
                    address: contractAddress,
                    event: parseAbiItem('event ProposalRegistered(uint proposalId)'),
                    fromBlock: 0n,
                    toBlock: 'latest'
                })
                setNumberProposals(registeredLogs.length);
            }
            getEvents();
        } else {
            setNumberProposals(nbProposals);
        }
    }, [])

    return(
        <Flex p='2rem'>
            {(numberProposals !== 0) ? 
                <>
                    {isLoading 
                    ? ( <Spinner /> ) : 
                    <TableContainer>
                        <Table variant='simple'>
                            <TableCaption>Proposals List</TableCaption>
                            <Thead>
                                <Tr>
                                    <Th>Proposal ID</Th>
                                    <Th>Description</Th>
                                    <Th>Number of votes</Th>
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