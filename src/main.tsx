

import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import Loading from './components/Loading'

createRoot(document.getElementById('root')!).render(

  <Suspense fallback={<Loading />}>

    <App />

  </Suspense>

)
