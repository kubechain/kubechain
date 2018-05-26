# Creating Hyperledger Fabric configuration

## Pre-requisites
- You've installed Docker.
  - Either native Docker or Docker Toolbox.

## Hyperledger Fabric configuration
1. At your current working directory create the following path and subsequent directories ``./configuration/fabric``
1. Add the standard Hyperledger Fabric configuration files to the ``./configuration/fabric`` directory.
   - These are ``configtx.yaml`` and ``crypto-config.yaml``
   - See [this directory](/docs/tutorials/fabric/configuration-samples/blockchain) for some samples.
1. Create the path ``./configuration/fabric/chaincodes``
1. Add any chaincodes as subdirectories to ``./configuration/fabric/chaincodes/``
   - **Important!**: Make sure that the id's use pass in the adapter options match the names of the subdirectories.
   
## Caveats
- You need to ensure that the organization names you're using are valid DNS1123 names. The organization names are used to create namespaces associated to that organization.
  - A valid DNS1123 name adheres to this regex: ``/[a-z0-9-]/g``, or in plain-speak: `only-characters-dashes-and-numbers-are-allowed-0000`