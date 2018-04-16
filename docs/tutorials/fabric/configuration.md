# Creating Hyperledger Fabric configuration

## Pre-requisites
- You've installed Docker.
  - Either native Docker or Docker Toolbox.

## Hyperledger Fabric configuration
1. At a preferred ``hostpath`` create a new directory named ``configuration``.
1. Create sub-directory named ``fabric`` in the ``configuration`` directory.
1. Add the standard Hyperledger Fabric configuration files to the ``fabric`` directory.
   - These are ``configtx.yaml`` and ``crypto-config.yaml``.
   - See [this directory](/docs/tutorials/fabric/configuration-samples) for some samples.
   
## Caveats
- You need to ensure that the organization names you're using are valid DNS1123 names. The organization names are used to create namespaces associated to that organization.
  - A valid DNS1123 name adheres to this regex: ``/[a-z0-9-]/g``, or in plain-speak: `only-characters-dashes-and-numbers-are-allowed-0000`