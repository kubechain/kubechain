import IResource from "../../../iresource";

export default interface IServicePort extends IResource {

    setProtocol(protocol: string): void;

    setTargetPort(targetPort: number): void;
}