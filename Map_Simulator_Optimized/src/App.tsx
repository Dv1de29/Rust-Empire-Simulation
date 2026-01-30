import { useState } from 'react'


import './App.css'

import { SettingsProvider } from './context/Context'
import Navbar from './components/Navbar'
import GamePage from './pages/GamePage'

import { STARTING_EMPIRES } from './assets/initials'

function App() {

  return (
    <>
      <SettingsProvider initialEmpires={STARTING_EMPIRES}>
        <AppLayout />
      </SettingsProvider>
    </>
  )
}


function AppLayout(){
    return (
        <>
            <div className="App">
                <Navbar />
                <main className='app-main'>
                    <GamePage></GamePage>
                </main>
            </div>
        </>
    )
}


export default App
