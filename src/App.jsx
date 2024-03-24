import React from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

//** Pages importing */

import Home from './pages/Home.jsx';
import Month from './pages/Month.jsx';
import PageNotFound from './pages/PageNotFound.jsx'
import Record from './pages/Record.jsx';
import Close from './pages/Close.jsx';
import View from './pages/View.jsx';
import ViewAll from './pages/ViewAll.jsx';

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/month' element={<Month />} />
        <Route path='/record' element={<Record />} />
        <Route path='/close' element={<Close />} />
        <Route path='/view' element={<View />} />
        <Route path='/view-all' element={<ViewAll />} />
        <Route path='*' element={<PageNotFound />} />
      </Routes>
    </Router>
  )
}
export default App
