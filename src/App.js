import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Visualizer from "./Pages/Visualizer";
import Gallery from "./Pages/Gallery";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/Visualizer" />} />
          <Route path="/Visualizer" element={<Visualizer />} />
          <Route path="/Gallery" element={<Gallery />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;