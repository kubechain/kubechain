export default interface AccountRepresentation {
    name: string;
    path: string;
    type: string;
    filePaths: {
        config: string;
        genesis: string;
        priv_validator: string
    };
}