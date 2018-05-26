import ResourceWriter from "../resourcewriter/resourcewriter";

export default interface IHasResources {
    addResources(writer: ResourceWriter, outputPath: string): void;
}