import * as Path from 'path';
import IOrganization from "./iorganization";
import Options from "../../../options";
import Organization from "./organization";
import Namespace from "../../../../../kubernetes-sdk/api/1.8/cluster/namespace";
import CertificateAuthority from "./peer/ca/ca";
import CommandLineInterFace from "./peer/cli/cli";
import Peer from "./peer/peer/peer";
import OrganizationRepresentation from "../../../utilities/blockchain/representation/organizations/representation";
import OrganizationEntityRepresentation from "../../../utilities/blockchain/representation/organizations/entities/representation";
import ConfigMapTuples from "../../../utilities/kubernetes/configmaptuples";
import {createDirectories, toJsonFile} from "../../../../../util";
import ConfigMapTuple from "../../../utilities/kubernetes/configmaptuple";
import {directoryTreeToConfigMapTuples} from "../../../utilities/kubernetes/configmap";

export default class PeerOrganization implements IOrganization {
    private options: Options;
    private representation: any;
    private configPath: string;
    private outputPaths: { root: string; peers: string; configmaps: string };
    private organization: Organization;
    private configMapTuples: ConfigMapTuples;

    constructor(options: Options, representation: OrganizationRepresentation) {
        this.organization = new Organization(representation, options);
        this.options = options;
        this.representation = representation;
        this.configPath = representation.path;
        this.outputPaths = this.createOutputPaths();
    }

    private createOutputPaths() {
        const outputPath = Path.join(this.options.get('$.kubernetes.paths.peerorganizations'), this.name());
        return {
            root: outputPath,
            peers: Path.join(outputPath, 'peers'),
            configmaps: Path.join(outputPath, 'configmaps')
        };
    }

    name() {
        return this.organization.name();
    }

    namespace() {
        return this.organization.namespace();
    }

    mspID() {
        return this.organization.mspID();
    }

    createKubernetesResources() {
        console.info("[PEER-ORGANISATION]:", this.name());
        this.createOrganisationDirectories();
        this.createConfiguration();
        this.createNamespace();
        this.createCli();
        this.createCa();
        this.createPeers();
    }

    private createOrganisationDirectories() {
        console.info("Creating configuration directories");
        createDirectories([this.outputPaths.peers, this.outputPaths.configmaps]);
    }

    private createConfiguration(): void {
        this.configMapTuples = directoryTreeToConfigMapTuples(this.representation.path, this.namespace());
        const tuples = this.configMapTuples.findForAbsolutePath(this.configPath);
        tuples.forEach((tuple: ConfigMapTuple) => {
            const json = tuple.getConfigMap().toJson();
            const name = json.metadata.name; //TODO: Change this. Ok for now.
            toJsonFile(this.outputPaths.configmaps, name, json);
        })
    }

    private createNamespace() {
        const outputPath = this.outputPaths.root;
        const namespace = new Namespace(this.name());
        toJsonFile(outputPath, this.name() + '-namespace', namespace.toJson());
    }

    private createCli() {
        const cli = new CommandLineInterFace(this, this.name(), this.options, this.configMapTuples);
        cli.toKubernetesResource(this.outputPaths.root);
    }

    private createCa() {
        const ca = new CertificateAuthority(this, this.representation.certificateAuthority, this.options, this.configMapTuples);
        ca.toKubernetesResource(this.outputPaths.root);
    }

    private createPeers() {
        console.info("Creating peers");
        this.representation.entities.map((representation: OrganizationEntityRepresentation) => {
            const peer = new Peer(representation, this, this.options, this.configMapTuples);
            peer.toKubernetesResource(this.outputPaths.peers);
        });
    }

    static equalsType(type: string) {
        return type === 'peer';
    }

    adminMspMountPath() {
        return Path.posix.join('users', `Admin@${this.organization.name()}`, 'msp');
    }

    adminHostPath(): string {
        return Path.join('users', `Admin@${this.organization.name()}`, 'msp');
    }

}