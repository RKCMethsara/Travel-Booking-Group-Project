import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import './styles.css';
import './performance.css';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Destinations from './pages/Destinations';
import PlacePage from './pages/PlacePage';
import BookNow from './pages/BookNow';
import Foods from './pages/Foods';
import Hire from './pages/Hire';
import Login from './pages/Login';
import BookingsView from './pages/BookingsView';
import Admin from './pages/Admin';

function App(){
  return (
    <BrowserRouter>
      <div className="app-root">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/destinations" element={<Destinations/>} />
            <Route path="/place/:id" element={<PlacePage/>} />
            <Route path="/book" element={<BookNow/>} />
            <Route path="/foods" element={<Foods/>} />
            <Route path="/hire" element={<Hire/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/bookings" element={<BookingsView/>} />
            <Route path="/admin" element={<Admin/>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
