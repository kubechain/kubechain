module.exports = {
    targets: {
        blockchain: "fabric",
        kubernetes: "minikube"
    },
    adapter: {
        options: {
            chaincodes: [{id: "chaincode_example02"}],
            channels: [
                {
                    name: "kubechain",
                    profile: "TwoOrgsChannel",
                    organizations: ["Org1MSP", "Org2MSP"]
                }
            ]
        }
    }
};