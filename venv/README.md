# BeyondDraw AI

## Run the application

Open two PowerShell terminals.

In the first terminal, start the API:

```powershell
cd "C:\Users\JEEVAN BHUYAN\BeyondDrawAI\venv\backend"
.\start-backend.ps1
```

In the second terminal, start the CAD workspace:

```powershell
cd "C:\Users\JEEVAN BHUYAN\BeyondDrawAI\venv\frontend"
npm install
npm run dev
```

Open the Vite URL printed by the frontend, normally `http://localhost:5173`.

## STEP/IGES preview

The 3D workspace converts `.step`, `.stp`, `.iges`, and `.igs` files into a mesh in the browser using OpenCascade WebAssembly. After uploading a valid model, use left mouse drag to rotate, mouse wheel to zoom, and right mouse drag to pan.

The backend is used to store models and will later generate 2D drawings. The local STEP/IGES preview does not depend on the API completing successfully.
