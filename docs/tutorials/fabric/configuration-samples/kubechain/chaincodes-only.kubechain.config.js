module.exports = {
    targets: {
        blockchain: "fabric",
        kubernetes: "minikube"
    },
    adapter: {
        options: {
            chaincodes: [{id: "chaincode_example02"}],
        }
    }
};