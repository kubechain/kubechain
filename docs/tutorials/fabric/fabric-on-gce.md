# Creating a Hyperledger Fabric cluster on Minikube

## Pre-requisites
- You've installed NodeJS (version 8 and higher) and NPM.
- You've created a Kuberntes cluster in GCE.
  - One way to do this is using [Kops](https://github.com/kubernetes/kops/blob/release-1.8/docs/tutorial/gce.md).
- You've installed Kubectl and added it to the PATH variable on your system.

## Setup the environment
1. Open a terminal/console.
1. Run: ``npm install -g kubechain``

## Create the Kubernetes Cluster

### Using CLI configuration
1. Open a new terminal/console.
1. Change your current directory to the ``hostpath`` where you created the ``configuration`` directory.
   - i.e. Run: ``cd hostpath``, not `cd hostpath/configuration`
1. Run: ``kubechain create config -b fabric -k gce``
1. Run: ``kubechain create cluster -b fabric -k gce``
1. Verify that the cluster is operational by your preferred means.

### Using the kubechain confgiruation file
1. Open a new terminal/console.
1. Copy one of the [configuration sample files for kubechain](/docs/tutorials/fabric/configuration-samples/kubechain) to your working directory.
   - Kubechain looks for a file named ``kubechain.config.js`` so you need to rename the file you copied.
   - For more details about the ``kubechain.config.js`` file check out the [configuration-file documentation](docs/kubechain/configuration-file.md) and the [Fabric adapter options documentation](docs/fabric/options.md).
1. Change your current directory to the ``hostpath`` where you created the ``configuration`` directory.
   - i.e. Run: ``cd hostpath``, not `cd hostpath/configuration`
1. Run: ``kubechain create config``
1. Run: ``kubechain create cluster``
1. Verify that the cluster is operational by your preferred means.