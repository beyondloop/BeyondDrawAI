declare module "occt-import-js" {
    type OcctModule = {
        ReadStepFile(content: Uint8Array, params: object | null): ImportResult;
        ReadIgesFile(content: Uint8Array, params: object | null): ImportResult;
    };

    type ImportResult = {
        success: boolean;
        meshes: Array<{
            name?: string;
            color?: [number, number, number];
            attributes: {
                position: { array: number[] };
                normal?: { array: number[] };
            };
            index: { array: number[] };
        }>;
    };

    export default function occtimportjs(options?: { locateFile?: (path: string) => string }): Promise<OcctModule>;
}
