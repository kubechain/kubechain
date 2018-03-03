import IResource from "../../iresource";

export default class EnvVar implements IResource {
    private name: string;
    private value: string;

    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
    }

    toJson(): any {
        return {
            "name": this.name,
            "value": this.value
        };
    }
}

// name
// string 	Name of the environment variable. Must be a C_IDENTIFIER.
//     value
// string 	Variable references $(VAR_NAME) are expanded using the previous defined environment variables in the container and any service environment variables. If a variable cannot be resolved, the reference in the input string will be unchanged. The $(VAR_NAME) syntax can be escaped with a double $$, ie: $$(VAR_NAME). Escaped references will never be expanded, regardless of whether the variable exists or not. Defaults to "".
//     valueFrom
// EnvVarSource 	Sou