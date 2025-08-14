import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Visualizer from "./Pages/Visualizer";
import Gallery from "./Pages/Gallery";

function App() {
  return (
    <Layout>
      <Routes>
        <Route index element={<Navigate to="Visualizer" replace />} />
        <Route path="Visualizer" element={<Visualizer />} />
        <Route path="Gallery" element={<Gallery />} />
        <Route path="*" element={<Navigate to="Visualizer" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
