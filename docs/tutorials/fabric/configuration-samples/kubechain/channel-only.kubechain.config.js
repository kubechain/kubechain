module.exports = {
    targets: {
        blockchain: "fabric",
        kubernetes: "minikube"
    },
    adapter: {
        options: {
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