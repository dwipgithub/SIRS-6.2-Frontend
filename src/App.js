import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from "./components/Login/Login"
import NavigationBar from "./components/NavigationBar/NavigationBar"

// User
import FormUbahPassword from "./components/User/FormUbahPassword"
import FormTambahUser from "./components/User/FormTambahUser"

// RL 3.2
import RL32 from "./components/RL32/RL32.js"
import FormTambahRL32 from "./components/RL32/FormTambahRL32"
import FormUbahRL32 from "./components/RL32/FormUbahRL32"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/beranda" element={<><NavigationBar/></>} />
        <Route path="/user/tambahuser" element={<><NavigationBar/><FormTambahUser/></>}/>
        <Route path="/user/ubahpassword" element={<><NavigationBar/><FormUbahPassword/></>}/>

        <Route path="/rl32" element={<><NavigationBar/><RL32/></>}/>
        <Route path="/rl32/tambah" element={<><NavigationBar/><FormTambahRL32/></>}/>
        <Route path="/rl32/ubah/:id" element={<><NavigationBar/><FormUbahRL32/></>}/>

        <Route path="*" element={<PageNotFound />} status={404}/>
      </Routes>
    </BrowserRouter>
  )
}

function PageNotFound() {
  return (
    <div className="container mt-3">
      <h3>404 page not found</h3>
      <p>We are sorry but the page you are looking for does not exist.</p>
    </div>
  );
}

export default App;
