# Dapp Voting

# Pour correction :

Lien vidéo :
Lien déploiement :
Déployé sur Sepolia
Groupe constitué de : Thomas Thierry et Nathanael Kubski

# Détails

# Contract 

La faille de sécurité a été corrigée comme suit : 
Pour éviter d'avoir une boucle for parcourant tout le tableau lors du comptage des votes (risque de DoS Gas Limit), le "vainqueur" actuel est calculé à chaque appel de la fonction setVote() et noté dans la variable winningProposalID. Ainsi, le vainqueur final est déterminé lors du dernier vote. La boucle for de la fonction tallyVotes() a donc été supprimée.
Nous avons également ajouté des commentaires pour expliquer ces changements.

# Front

Voici la liste de la stack utilisée pour ce projet :
- React
- Wagmi
- Viem
- RainbowKit
- Chakra UI

