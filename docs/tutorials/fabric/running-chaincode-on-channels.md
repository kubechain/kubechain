# Running Chaincode on Channels
This tutorial walks you through using Kubechain and creating chaincode and channels in Hyperledger Fabric Kubernetes cluster.

## Prerequisites 
- You've installed Kubechain [see this tutorial if you've not](docs/how-to-install.md).
- You've installed Kubectl.
- You've a functioning Kubernetes cluster (either in Minikube  or GCE).

## Configuration 
1. In your current working directory (CWD) add the following path `./configuration/fabric/`.
1. Copy [the blockchain directory](docs/tutorials/fabric/configuration-samples/blockchain) to the directory you just created.
1. If you've left the original CWD go there again and copy [the chaincode-and-channel file](/configuration-samples/kubechain/chaincode-and-channel.kubechain.config.js) to the CWD.
1. Rename the file to ``kubechain.config.js``

## Cluster creation
1. Run: ``kubechain create config``
1. Run: ``kubechain create cluster``

## Execute creation commands in a cli-pod
1. Find the name of the cli-pod running in organization ``org1-f-1``
1. Run: `kubectl exec -it ${cli-pod-name} --namespace=org1-f-1 bash`
1. Repeat for other organizations if you wish.

### Channel creation
**Attention**: For this to work, make sure you've a proxy running with kubectl if necessary.
1. Run: `peer channel create -o orderer0.ordererorg-f-1:7050 -c kubechain -f ./channels/kubechain/kubechain.tx`
   - This creates the channel
1. Run: `peer channel join -b ./kubechain.block`
   - This makes the peer your CLI has remote access to join the channel.
1. Run: `peer channel update -o orderer0.ordererorg-f-1:7050 -c kubechain -f ./channels/kubechain/Org1MSPanchors.tx`
   - This updates the channels peer-anchor for organization ``org1-f-1``.

### Chaincode creation
In the same cli-pod.
1. Run: `peer chaincode install -n mycc -v 1.0 -p github.com/hyperledger/fabric/peer/chaincodes/chaincode_example02`
   - Installs the chaincode on the cli's remote peer.
1. Run: `peer chaincode instantiate -o orderer0.ordererorg-f-1:7050 -C "kubechain" -n mycc -v 1.0 -c '{"Args": ["init","a","100","b","200"]}' -P "OR ('Org1MSP.member', 'Org2MSP.member')"`
   - Instantiates the chaincode on the cli's remote peer.
1. Run: `peer chaincode query -C kubechain -n mycc -c '{"Args":["query","a"]}'`
   - Queries the chaincode on the cli's remote peer.
   - Should return: ``100``

### All commands in a row

``
peer channel create -o orderer0.ordererorg-f-1:7050 -c kubechain -f ./channels/kubechain/kubechain.tx
peer channel join -b ./kubechain.block
peer channel update -o orderer0.ordererorg-f-1:7050 -c kubechain -f ./channels/kubechain/Org1MSPanchors.tx
peer chaincode install -n mycc -v 1.0 -p github.com/hyperledger/fabric/peer/chaincodes/chaincode_example02
peer chaincode instantiate -o orderer0.ordererorg-f-1:7050 -C "kubechain" -n mycc -v 1.0 -c '{"Args": ["init","a","100","b","200"]}' -P "OR ('Org1MSP.member', 'Org2MSP.member')"
peer chaincode query -C kubechain -n mycc -c '{"Args":["query","a"]}'
``
