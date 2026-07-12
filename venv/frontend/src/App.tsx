import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Home from "./pages/Home";
import Upload from "./pages/Upload";

export default function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route path="/" element={<MainLayout />}>

                    <Route index element={<Home />} />

                    <Route path="upload" element={<Upload />} />

                </Route>

            </Routes>

        </BrowserRouter>

    );

}