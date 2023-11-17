'use client'
import { Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer } from '@chakra-ui/react'

import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';

import { abi, contractAddress } from '@/constants';

import { useState, useEffect } from 'react';

import { Flex, Alert, AlertIcon, Heading, Input, Button, Text, useToast, Spinner } from '@chakra-ui/react';

const ProposalsTable = ({ nbProposals }) => {

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
            if (i === nbProposals) {
                setIsLoading(false)
            }
        }
        catch(err) {
            console.log(err.message)
        }
    }

    useEffect(() => {
        for(let i = 1; i <= nbProposals; i++) {
            pushProposal(i);
        }
    }, [nbProposals])

    useEffect(() => {
        console.log(proposalsArray)
        if (!isLoading) {
            setProposalsComponents([])
            for(let i = 0; i < nbProposals; i++) {   
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

    return(
        <Flex p='2rem'>
            {(nbProposals !== 0) ? 
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