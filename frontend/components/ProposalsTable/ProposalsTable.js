'use client'
import { Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer } from '@chakra-ui/react'

const ProposalsTable = ({ nbProposals }) => {

    const proposalsArray = [{description: "cc", voteCount: 0}, {description: "GG", voteCount: 2}, {description: "propsoal", voteCount: 8}]
    let id = 0;
    nbProposals = 2;
    let proposalsComponents = [];
    while(id < nbProposals) {
        id++;
        proposalsComponents.push(
            <Tr>
                <Th>{id}</Th>
                <Th>{proposalsArray[id].description}</Th>
                <Th>{proposalsArray[id].voteCount}</Th>
            </Tr>
        )
    }

    return(
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
    )
}

export default ProposalsTable;