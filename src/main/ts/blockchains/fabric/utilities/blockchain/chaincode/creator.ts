import IChainCode from "./options";
import Options from "../../../options";

export default class ChainCodeCreator {
    private options: Options;

    constructor(options: Options) {
        this.options = options;
    }

    create(configuration: IChainCode) {
        /*
        STEPS
        - Convert source code to ConfigMaps
        - Add configmaps to container
        - Chaincode = path
         */
    }
}