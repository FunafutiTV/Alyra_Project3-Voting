// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

/// @title A voting contract
/// @author Alyra
/// @notice You can use this contract to implement a very basic vote in the blockchain
/** 
 * @dev 
 * This contract is using OpenZeppelin's Ownable contract, which means that the address deploying the contract
 * will be the contract's "owner".
 * Only the owner will be able to perform certain actions, such as whitelisting a voter or navigating between
 * the different phases of the contract
 * The owner has full control about which addresses will be whitelisted and when each sessions will start and
 * end, which could be a problem
 *
 * This contract does not cover special cases, such as when no proposals or votes are submitted, or when two
 * proposals get the same amount of votes.
 */ 
contract Voting is Ownable {

    /// @notice This variable will contain the ID of the proposal which has won the vote
    /// @dev This variable will determine the current winner every time the setVote function is called
    uint public winningProposalID;
    
    /** 
     * @dev
     * This structure will be used in a mapping to match with an address
     * isRegistered will be set to true when the address is registered
     * hasVoted will be set to true when the address has voted
     * votedProposalId will be set to the ID of the proposal the address has voted for
     */
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    /** 
     * @dev
     * description is chosen by the user as a parameter of the addProposal function
     * voteCount will be incremented by one everytime it is voted for
     */
    struct Proposal {
        string description;
        uint voteCount;
    }
    
    /// @dev This enum is used for the workflowStatus variable
    enum  WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /// @notice This variable contains the current "stage" of the contract
    /// @dev Every non getter function will return if the value of this variable is not appropriate
    WorkflowStatus public workflowStatus;

    /// @dev This array of Proposal structs will contain all the proposals  
    Proposal[] proposalsArray;

    /// @dev This mapping links every address to a Voter struct
    mapping (address => Voter) voters;

    /// @notice This event will be emitted every time a voter is registered
    /// @dev This event will be emitted every time the addVoter function is executed
    /// @param voterAddress The address that has been whitelisted
    event VoterRegistered(address voterAddress); 

    /// @notice This event will be emitted every time the owner decides to start the next "stage"
    /// @dev This event will be emitted every time a state function is executed
    /// @param previousStatus The previous "stage" of the contract
    /// @param newStatus The new current "stage" of the contract
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);

    /// @notice This event will be emitted every time a proposal is registered
    /// @dev This event will be emitted every time the addProposal function is executed
    /// @param proposalId The ID of the registered proposal
    event ProposalRegistered(uint proposalId);

    /// @notice This event will be emitted every time a vote occurs
    /// @notice This event will be emitted every time the setVote function is executed
    /// @param voter The address of the user that has voted
    /// @param proposalId The ID of the proposal the user has voted for
    event Voted (address voter, uint proposalId);

    /// @dev Necessary constructor to use the Ownable contract and set the address deploying the contract as owner
    constructor() Ownable(msg.sender) {    }
    
    /// @dev This modifier will revert the function if the address has not be registered by the owner with addVoter
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }
    
    // on peut faire un modifier pour les états

    // ::::::::::::: GETTERS ::::::::::::: //

    /// @notice This function allows to check if an address is registered and if (and for which proposal) it has voted
    /// @dev This function can only be called by voters thanks to the onlyVoters modifier
    /// @param _addr The address we want to check
    /// @return voters[_addr] The Voter struct of the address
    function getVoter(address _addr) external onlyVoters view returns (Voter memory) {
        return voters[_addr];
    }
    
    /// @notice This function allows to get a proposal's description and number of votes given its ID
    /// @dev This function can only be called by voters thanks to the onlyVoters modifier
    /// @param _id The ID of the proposal we want
    /// @return proposalsArray[_id] The Proposal struct corresponding to the ID
    function getOneProposal(uint _id) external onlyVoters view returns (Proposal memory) {
        return proposalsArray[_id];
    }

 
    // ::::::::::::: REGISTRATION ::::::::::::: // 

    /// @notice This function registers an address to the whitelist
    /** 
     * @dev 
     * This function can only be called by the owner thanks to the onlyOwner modifier from the Ownable contract
     * This function reverts if the workflowStatus is not at RegisteringVoters
     * This function reverts if the address is already registered
     */
    /// @param _addr The address of the user that will be whitelisted
    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
        require(voters[_addr].isRegistered != true, 'Already registered');
    
        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }
 

    // ::::::::::::: PROPOSAL ::::::::::::: // 

    /// @notice This function registers a new proposal
    /** 
     * @dev 
     * This function can only be called by voters thanks to the onlyVoters modifier
     * This function reverts if the workflowStatus is not at ProposalsRegistrationStarted
     * This function reverts if _desc if the empty string
     */
    /// @param _desc The description of the proposal to register
    function addProposal(string calldata _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Proposals are not allowed yet');
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), 'Vous ne pouvez pas ne rien proposer'); // facultatif
        // voir que desc est different des autres

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        // proposalsArray.push(Proposal(_desc,0));
        emit ProposalRegistered(proposalsArray.length-1);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    /// @notice This function registers a vote to a proposal
    /** 
     * @dev 
     * This function can only be called by voters thanks to the onlyVoters modifier
     * This function reverts if the workflowStatus is not at VotingSessionStarted
     * This function reverts if _id is greater than proposalArray's length
     * This function reverts if the caller has already voted
     * If the proposal of ID _id has more votes than the currently highest voted proposal, it is affected 
     * to winningProposalID
     */
    /// @param _id The ID of the proposal that the caller wants to vote for
    function setVote( uint _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        require(voters[msg.sender].hasVoted != true, 'You have already voted');
        require(_id < proposalsArray.length, 'Proposal not found'); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        if (proposalsArray[_id].voteCount > proposalsArray[winningProposalID].voteCount) {
            winningProposalID = _id;  // Pour éviter les attaques DoS, le "vainqueur" actuel est déterminé lors de chaque vote sans avoir à parcourir le tableau
        }

        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //

    /// @notice This function starts the proposal registration session
    /** 
     * @dev 
     * This function can only be called by the owner thanks to the onlyOwner modifier from the Ownable contract
     * This function reverts if the workflowStatus is not at RegisteringVoters
     * A "GENESIS" proposal is created and pushed as element 0 of proposalsArray
     */
    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Registering proposals cant be started now');
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        
        Proposal memory proposal;
        proposal.description = "GENESIS";
        proposalsArray.push(proposal);
        
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /// @notice This function ends the proposal registration session
    /** 
     * @dev 
     * This function can only be called by the owner thanks to the onlyOwner modifier from the Ownable contract
     * This function reverts if the workflowStatus is not at ProposalsRegistrationStarted
     */
    function endProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Registering proposals havent started yet');
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    /// @notice This function starts the voting session
    /** 
     * @dev 
     * This function can only be called by the owner thanks to the onlyOwner modifier from the Ownable contract
     * This function reverts if the workflowStatus is not at ProposalsRegistrationEnded
     */
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, 'Registering proposals phase is not finished');
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /// @notice This function ends the voting session
    /** 
     * @dev 
     * This function can only be called by the owner thanks to the onlyOwner modifier from the Ownable contract
     * This function reverts if the workflowStatus is not at VotingSessionStarted
     */
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    /// @notice This function ends the contract's process
    /** 
     * @dev 
     * This function can only be called by the owner thanks to the onlyOwner modifier from the Ownable contract
     * This function reverts if the workflowStatus is not at VotingSessionEnded
     * This function does not actually do anything aside from changing the workflowStatus, as the winning proposal
     * as already been decided during the voting session, every time the setVote function was called
     */
   function tallyVotes() external onlyOwner { // Pour éviter les attaques DoS, le vainqueur est décidé au moment du vote et la boucle for parcourant le tableau a été supprimée
       require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");
       workflowStatus = WorkflowStatus.VotesTallied; 
       emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }
}