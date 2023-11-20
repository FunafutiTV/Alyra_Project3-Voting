# Dapp Voting

# Pour correction :

- Lien vidéo : https://www.loom.com/share/59c1fdcc3e4f446cabd11d8890383b4a?sid=df345609-43b7-4e8e-92c1-df44c2d86c7c
- Lien déploiement : 
- Déployé sur Sepolia : 0xA6CdeB35BFda09242e3240Dee74D8F554BaEf66D
- Groupe constitué de : Thomas Thierry et Nathanael Kubski

# Détails

# Contract 

La faille de sécurité a été corrigée comme suit : 
Pour éviter d'avoir une boucle for parcourant tout le tableau lors du comptage des votes (risque de DoS Gas Limit), le "vainqueur" actuel est calculé à chaque appel de la fonction setVote() et noté dans la variable winningProposalID. Ainsi, le vainqueur final est déterminé lors du dernier vote. La boucle for de la fonction tallyVotes() a donc été supprimée.
Nous avons également ajouté des commentaires en NatSpec sur le contrat

# Front

Voici la liste de la stack utilisée pour ce projet :
- Node 20.9.0
- Nextjs 13.5
- Wagmi
- Viem
- RainbowKit
- Chakra UI

