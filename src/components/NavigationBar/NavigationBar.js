import React, { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import axios from 'axios'
import jwt_decode from 'jwt-decode'
import { Link, useNavigate } from 'react-router-dom'
import logoImage from '../Images/sirsIcon.png'

const NavigationBar = () => {
    // const [token, setToken] = useState('')
    const [expire, setExpire] = useState('')
    const [user, setUser] = useState({})

    const navigate = useNavigate()

    useEffect(() => {
        refreshToken()
        document.title = "SIRS Online Versi 6"
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const refreshToken = async () => {
        try {
            const response = await axios.get('/apisirs6v2/token')
            // setToken(response.data.accessToken)
            const decoded = jwt_decode(response.data.accessToken)
            setUser(decoded)
            setUser(prevState => {
                // console.log(prevState)
                return prevState;
            })
            setExpire(decoded.exp)
        } catch (error) {
            if (error.response) {
                navigate('/')
            }
        }
    }

    const axiosJWT = axios.create()
    axiosJWT.interceptors.request.use(async (config) => {
        const currentDate = new Date()
        if (expire * 1000 < currentDate.getTime()) {
            const response = await axios.get('/apisirs6v2/token')
            config.headers.Authorization = `Bearer ${response.data.accessToken}`
            // setToken(response.data.accessToken)
            const decoded = jwt_decode(response.data.accessToken)
            setExpire(decoded.exp)
        }
        return config
    }, (error) => {
        return Promise.reject(error)
    })

    const Logout = async () => {
        try {
            await axios.delete('/apisirs6v2/logout')
            localStorage.removeItem('id')
            navigate('/')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Navbar className="navbar fixed-top navbar-expand-lg" style={{ backgroundSize: "0", backgroundColor: "#E1E6EA" }}>
            <Container>
                <Navbar.Brand as={Link} to="/beranda">
                    <img
                        src={logoImage}
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                        alt=""
                        as={Link} to="/rl31"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/beranda">Beranda</Nav.Link>
                        <NavDropdown title="RL.3" id="basic-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/rl32">
                                RL 3.2 Rawat Inap
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/rl38">
                                RL 3.8 Laboratorium
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/rl39">
                                RL 3.9 Radiologi
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/rl311">
                                RL 3.11 Gigi Dan Mulut
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/rl312">
                                RL 3.12 Pembedahan
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/rl313">
                                RL 3.13 Rehabilitasi Medik
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/rl314">
                                RL 3.14 Rujukan
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/rl317">
                                RL 3.17 Farmasi Pengadaan Obat
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/rl318">
                                RL 3.18 Farmasi Resep
                            </NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="RL.4" id="basic-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/rl41">
                                RL 4.1 Morbiditas Pasien Rawat Inap
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/rl42">
                                RL 4.2 10 Besar Penyakit Rawat Inap
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/rl43">
                                RL 4.3 10 Besar Kematian Penyakit Pasien Rawat Inap
                            </NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="RL.5" id="basic-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/rl52">
                                RL 5.2 10 Besar Kasus Baru Penyakit Rawat Jalan
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/rl53">
                                RL 5.3 10 Besar Kunjungan Penyakit Rawat Jalan
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>

                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>
                        <NavDropdown title={<span style={{ color: "gray" }}>{`Login as ${user.nama}`}</span>} id="basic-nav-dropdown">
                            {/* <NavDropdown.Item as={Link} to="/user/tambahuser">Tambah Pengguna</NavDropdown.Item> */}
                            <NavDropdown.Item as={Link} to="/user/ubahpassword">Ubah Sandi</NavDropdown.Item>
                            <NavDropdown.Item onClick={Logout}>Log Out</NavDropdown.Item>
                        </NavDropdown>
                    </Navbar.Text>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default NavigationBar