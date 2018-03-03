import IServicePort from "../ports/iserviceport";
import ILabelSelector from "../../../meta/ilabeleselector";

export default interface IServiceSpec extends ILabelSelector {
    addServicePort(port: IServicePort): void;
}