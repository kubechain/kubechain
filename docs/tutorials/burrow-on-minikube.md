# Creating a Hyperledger Burrow cluster on Minikube

**Pre-requisites**
- You've installed NodeJS (version 8 and higher) and NPM.
- You've installed Minikube and added it to the PATH variable on your system.
- You've installed Kubectl and added it to the PATH variable on your system.
- You've installed Docker.
  - Either native Docker or Docker Toolbox.

**Setup the environment**
1. Open a terminal/console.
1. Run: ``npm install -g kubechain``
1. Run: ``minikube start``
1. Run: ``kubectl proxy``
   - Do not forget to proxy. Kubechain does not support picking a Kubernetes cluster.
   
**Hyperledger Burrow configuration**
1. At a preferred ``hostpath`` create a new directory named ``configuration``.
1. Create sub-directory named ``burrow`` in the ``configuration`` directory.
1. Create sub-directory named ``accounts`` in the ``burrow`` directory.
1. Create the Burrow accounts:
   1. *When using Native Docker*
        1. Run: ``docker run --rm -v /${hostpath}/configuration/burrow/accounts:/root/.monax/chains/${chainName} -it --privileged --name monax-cli -d quay.io/monax/monax:0.18.0-dind /bin/bash``
           - Where ``${hostpath}`` is the path where you've previously the `burrow` directory.
           - Where ``${chainName}`` is the name of the chain you would like to create.
   1. *When using Docker Toolbox*
        1. Run: ``docker run --rm -v ${sharedHostFolder}/${user}/.kubechain/burrow/configuration:/root/.monax -it --privileged --name monax-cli -d quay.io/monax/monax:0.18.0-dind /bin/bash``
           - Where: ``${sharedHostFolder}`` is depended on the host OS of Docker Toolbox.
             - **Note**: Docker Toolbox uses VirtualBox under the hood. Opening VirtualBox will allow you to check which folders are shared.
             - *For windows* `${sharedHostFolder}` is: ``/c/Users``
           - Where: ``${user}`` is the current windows user.
1. Run: ``docker exec monax-cli monax init --yes``
1. Run: ``docker exec monax-cli monax chains make ${chainName} --account-types=Full:1,Validator:1 --unsafe``
   - Where: ``${chainName}`` is the name of the chain you would like to create.
   - **Note**: Hyperledger Burrow needs a minimum of ``2`` accounts with validation capabilities to function.
1. Ensure that the directory ``${hostpath}/configuration/burrow/accounts`` contains the burrow node configurations.
   1. *When using Docker Toolbox*
        1. Copy the contents from: ``${sharedHostFolder}/${user}/.kubechain/burrow/configuration/chains/${chainName}`` to ``/${hostpath}/burrow/configuration``
           - Where ``${hostpath}`` is the path where you've previously the `burrow` directory.

**Create the Kubernetes Cluster**
1. Open a new terminal/console.
1. Change your current directory to the ``hostpath`` where you created the ``configuration`` directory.
   - i.e. Run: ``cd hostpath``, not `cd hostpath/configuration`
1. Run: ``kubechain create config burrow``
1. Run: ``kubechain create cluster burrow``
1. Verify that the cluster is operational by your preferred means.