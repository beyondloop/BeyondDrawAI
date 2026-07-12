import { useState } from "react";
import { Button, Typography } from "@mui/material";
import { uploadCAD } from "../services/uploadService";

export default function Upload() {

    const [file, setFile] = useState<File | null>(null);

    const upload = async () => {

        if (!file) return;

        const result = await uploadCAD(file);

        console.log(result);

        alert("CAD Uploaded Successfully");

    };

    return (

        <div style={{ padding: 40 }}>

            <Typography variant="h4">

                Upload CAD Model

            </Typography>

            <input

                type="file"

                accept=".step,.stp,.iges,.igs,.stl,.obj,.gltf,.glb,.brep,.x_t,.x_b"

                onChange={(e) => {

                    if (e.target.files)

                        setFile(e.target.files[0]);

                }}

            />

            <br /><br />

            <Button

                variant="contained"

                onClick={upload}

            >

                Upload

            </Button>

        </div>

    );
}