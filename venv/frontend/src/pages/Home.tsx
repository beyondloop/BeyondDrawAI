import { Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Home() {

    const navigate = useNavigate();

    return (

        <div style={{ padding: 40 }}>

            <Typography variant="h3">

                BeyondDraw AI

            </Typography>

            <Typography>

                AI Powered Engineering Drawing Generator

            </Typography>

            <Button
                variant="contained"
                sx={{ mt: 3 }}
                onClick={() => navigate("/upload")}
            >

                Start

            </Button>

        </div>

    );
}