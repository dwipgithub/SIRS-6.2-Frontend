import React, { useState, useEffect } from 'react'
import axios from 'axios'
import jwt_decode from 'jwt-decode'
import { useNavigate, Link } from 'react-router-dom'
import style from './FormTambahRL35.module.css'
import { HiSaveAs } from 'react-icons/hi'
import { RiDeleteBin5Fill, RiEdit2Fill } from 'react-icons/ri'
import { AiFillFileAdd } from 'react-icons/ai'
import { confirmAlert } from 'react-confirm-alert'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import 'react-confirm-alert/src/react-confirm-alert.css'
import Spinner from 'react-bootstrap/Spinner'
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table'

const RL35 = () => {
    const [bulan, setBulan] = useState(1)
    const [tahun, setTahun] = useState('')
    const [filterLabel, setFilterLabel] = useState([])
    const [daftarBulan, setDaftarBulan] = useState([])
    const [rumahSakit, setRumahSakit] = useState('')
    const [daftarRumahSakit, setDaftarRumahSakit] = useState([])
    const [daftarProvinsi, setDaftarProvinsi] = useState([])
    const [daftarKabKota, setDaftarKabKota] = useState([])
    const [dataRL, setDataRL] = useState([])
    const [token, setToken] = useState('')
    const [expire, setExpire] = useState('')
    const [show, setShow] = useState(false);
    const [user, setUser] = useState({})
    const navigate = useNavigate()
    const [spinner, setSpinner]= useState(false)
    const [total_kunjungan_pasien_dalam_kabkota, setTotalKunjunganPasienDalamKabkota] = useState(0)
    const [total_kunjungan_pasien_luar_kabkota, setTotalKunjunganPasienLuarKabkota] = useState(0)
    const [total_kunjungan, setTotalKunjungan] = useState(0)

    useEffect(() => {
        refreshToken()
        getBulan()
        const getLastYear = async () => {
            const date = new Date()
            setTahun(date.getFullYear())
            return date.getFullYear()
        }
        getLastYear().then((results) => {
            
        })

        totalPengunjung()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[dataRL])

    const refreshToken = async() => {
        try {
            const response = await axios.get('/apisirs6v2/token')
            setToken(response.data.accessToken)
            const decoded = jwt_decode(response.data.accessToken)
            showRumahSakit(decoded.satKerId)
            setExpire(decoded.exp)
            setUser(decoded)
        } catch (error) {
            if(error.response) {
                navigate('/')
            }
        }
    }

    const axiosJWT = axios.create()
    axiosJWT.interceptors.request.use(async(config) => {
        const currentDate = new Date()
        if (expire * 1000 < currentDate.getTime()) {
            const response = await axios.get('/apisirs6v2/token')
            config.headers.Authorization = `Bearer ${response.data.accessToken}`
            setToken(response.data.accessToken)
            const decoded = jwt_decode(response.data.accessToken)
            setExpire(decoded.exp)
        }
        return config
    }, (error) => {
        return Promise.reject(error)
    })

    const getBulan = async () => {
        const results = []
        results.push({
            key: "Januari",
            value: "1",
        })
        results.push({
            key: "Febuari",
            value: "2",
        })
        results.push({
            key: "Maret",
            value: "3",
        })
        results.push({
            key: "April",
            value: "4",
        })
        results.push({
            key: "Mei",
            value: "5",
        })
        results.push({
            key: "Juni",
            value: "6",
        })
        results.push({
            key: "Juli",
            value: "7",
        })
        results.push({
            key: "Agustus",
            value: "8",
        })
        results.push({
            key: "September",
            value: "9",
        })
        results.push({
            key: "Oktober",
            value: "10",
        })
        results.push({
            key: "November",
            value: "11",
        })
        results.push({
            key: "Desember",
            value: "12",
        })

        setDaftarBulan([...results])
    }

    const bulanChangeHandler = async (e) => {
        setBulan(e.target.value)
    }

    const tahunChangeHandler = (event) => {
        setTahun(event.target.value)
    }

    const provinsiChangeHandler = (e) => {
        const provinsiId = e.target.value
        getKabKota(provinsiId)
    }

    const kabKotaChangeHandler = (e) => {
        const kabKotaId = e.target.value
        getRumahSakit(kabKotaId)
    }

    const rumahSakitChangeHandler = (e) => {
        const rsId = e.target.value
        showRumahSakit(rsId)
    }

    const getRumahSakit = async (kabKotaId) => {
        try {
            const response = await axiosJWT.get('/apisirs6v2/rumahsakit/', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    kabKotaId: kabKotaId
                }
            })
            setDaftarRumahSakit(response.data.data)
        } catch (error) {

        }
    }

    const showRumahSakit = async (id) => {
        try {
            const response = await axiosJWT.get('/apisirs6v2/rumahsakit/' + id, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            setRumahSakit(response.data.data)
        } catch (error) {

        }
    }

    const changeHandlerSingle = (event) => {
        const name = event.target.name
        if (name === 'tahun') {
            setTahun(event.target.value)
        } else if (name === 'bulan') {
            setBulan(event.target.value)
        }
    }

    const changeHandler = (event, index) => {
        const name = event.target.name
        if (name === 'check') {
            if (event.target.checked === true) {
                hapus()
            } else if (event.target.checked === false) {
                console.log('hello2')
            }
        }
    }

    const getRL = async (e) => {
        let date = (tahun+'-'+bulan+'-01')
        e.preventDefault()
        setSpinner(true)
        if (rumahSakit == null){
            toast(`rumah sakit harus dipilih`, {
                position: toast.POSITION.TOP_RIGHT
            })
            return
        }
        const filter = []
        filter.push("nama: ".concat(rumahSakit.nama))
        filter.push("periode: ".concat(String(tahun).concat("-").concat(bulan)))
        setFilterLabel(filter)
        try {
            const customConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    rsId: rumahSakit.id,
                    tahun: date
                }
            }
            const results = await axiosJWT.get('/apisirs6v2/rltigatitiklima',
                customConfig)
            
            // console.log(results)

            const rlTigaTitikLimaDetails = results.data.data.map((value) => {
                return value.rl_tiga_titik_lima_details
            })

            let dataRLTigaTitikLimaDetails = []
            rlTigaTitikLimaDetails.forEach(element => {
                element.forEach(value => {
                    dataRLTigaTitikLimaDetails.push(value)
                })
            })

            // console.log(dataRLTigaTitikLimaDetails)

            setDataRL(dataRLTigaTitikLimaDetails)
            setSpinner(false)
            
            handleClose()
        } catch (error) {
            console.log(error)
            setSpinner(false)
        }
    }

    const totalPengunjung = () => {
        console.log(dataRL)
        let total1 = 0
        let total2 = 0
        let total3 = 0
        dataRL.map((value, index) =>
            {
                if(value.jenis_kegiatan_id == 32 || value.jenis_kegiatan_id == 33){
                    total1 = total1
                        total2 = total2
                        total3 = total3
                } else {
                    total1 = total1 + value.kunjungan_pasien_dalam_kabkota
                        total2 = total2 + value.kunjungan_pasien_luar_kabkota
                        total3 = total3 + value.total_kunjungan
                }
            }
        )
        console.log(total1)
        console.log(total2)
        console.log(total3)
        setTotalKunjunganPasienDalamKabkota(total1)
        setTotalKunjunganPasienLuarKabkota(total2)
        setTotalKunjungan(total3)
    }

    const hapusData = async(id) => {
        const customConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            await axiosJWT.delete(`/apisirs6v2/rltigatitiklima/${id}`,
                customConfig)
            setDataRL((current) =>
                current.filter((value) => value.id !== id)
            )
            toast('Data Berhasil Dihapus', {
                position: toast.POSITION.TOP_RIGHT
            })
        } catch (error) {
            console.log(error)
            toast('Data Gagal Disimpan', {
                position: toast.POSITION.TOP_RIGHT
            })
        }
    }

    const hapus = (id) => {
        confirmAlert({
            title: 'Konfirmasi Penghapusan',
            message: 'Apakah Anda Yakin? ',
            buttons: [
                {
                    label: 'Ya',
                    onClick: () => {
                        hapusData(id)
                    }
                },
                {
                    label: 'Tidak'
                }
            ]
        })
    }

    const handleClose = () => setShow(false);

    const handleShow = () => {
        const jenisUserId = user.jenisUserId
        const satKerId = user.satKerId
        switch (jenisUserId) {
            case 1:
                getProvinsi()
                setBulan(1)
                setShow(true)
                break
            case 2:
                getKabKota(satKerId)
                setBulan(1)
                setShow(true)
                break
            case 3:
                getRumahSakit(satKerId)
                setBulan(1)
                setShow(true)
                break
            case 4:
                showRumahSakit(satKerId)
                setBulan(1)
                setShow(true)
                break
            default:
        }
    }

    const getProvinsi = async() => {
        try {
            const customConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
            const results = await axiosJWT.get('/apisirs6v2/provinsi',
                customConfig)

            const daftarProvinsi = results.data.data.map((value) => {
                return value
            })

            setDaftarProvinsi(daftarProvinsi)
        } catch (error) {
            console.log(error)
        }
    }

    const getKabKota = async(provinsiId) => {
        try {
            const customConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    provinsiId: provinsiId
                }
            }
            const results = await axiosJWT.get('/apisirs6v2/kabkota',
                customConfig)

            const daftarKabKota = results.data.data.map((value) => {
                return value
            })

            setDaftarKabKota(daftarKabKota)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="container" style={{marginTop: "70px"}}>
                <Modal show={show} onHide={handleClose} style={{position: "fixed"}}>
                    <Modal.Header closeButton>
                        <Modal.Title>Filter</Modal.Title>
                    </Modal.Header>

                    <form onSubmit={getRL}>
                        <Modal.Body>
                            {
                                user.jenisUserId === 1 ? (
                                    <>
                                        <div className="form-floating" style={{ width: "100%", paddingBottom: "5px"}}>
                                            <select
                                                name="provinsi"
                                                id="provinsi"
                                                typeof="select"
                                                className="form-select"
                                                onChange={e => provinsiChangeHandler(e)}
                                                >
                                                <option key={0} value={0}>Pilih</option>
                                                {daftarProvinsi.map((nilai) => {
                                                    return (
                                                    <option
                                                        key={nilai.id}
                                                        value={nilai.id}
                                                    >
                                                        {nilai.nama}
                                                    </option>
                                                    );
                                                })}
                                            </select>
                                            <label htmlFor="provinsi">Provinsi</label>
                                        </div>

                                        <div className="form-floating" style={{ width: "100%", paddingBottom: "5px"}}>
                                            <select
                                                name="kabKota"
                                                id="kabKota"
                                                typeof="select"
                                                className="form-select"
                                                onChange={e => kabKotaChangeHandler(e)}
                                                >
                                                <option key={0} value={0}>Pilih</option>
                                                {daftarKabKota.map((nilai) => {
                                                    return (
                                                    <option
                                                        key={nilai.id}
                                                        value={nilai.id}
                                                    >
                                                        {nilai.nama}
                                                    </option>
                                                    );
                                                })}
                                            </select>
                                            <label htmlFor="kabKota">Kab/Kota</label>
                                        </div>

                                        <div className="form-floating" style={{ width: "100%", paddingBottom: "5px"}}>
                                            <select
                                                name="rumahSakit"
                                                id="rumahSakit"
                                                typeof="select"
                                                className="form-select"
                                                onChange={e => rumahSakitChangeHandler(e)}
                                                >
                                                <option key={0} value={0}>Pilih</option>
                                                {daftarRumahSakit.map((nilai) => {
                                                    return (
                                                    <option
                                                        key={nilai.id}
                                                        value={nilai.id}
                                                    >
                                                        {nilai.nama}
                                                    </option>
                                                    );
                                                })}
                                            </select>
                                            <label htmlFor="rumahSakit">Rumah Sakit</label>
                                        </div>
                                    </>
                                ) : (
                                    <></>
                                )
                            }
                            {
                                user.jenisUserId === 2 ? (
                                    <>
                                        <div className="form-floating" style={{ width: "100%", paddingBottom: "5px"}}>
                                            <select
                                                name="kabKota"
                                                id="kabKota"
                                                typeof="select"
                                                className="form-select"
                                                onChange={e => kabKotaChangeHandler(e)}
                                                >
                                                <option key={0} value={0}>Pilih</option>
                                                {daftarKabKota.map((nilai) => {
                                                    return (
                                                    <option
                                                        key={nilai.id}
                                                        value={nilai.id}
                                                    >
                                                        {nilai.nama}
                                                    </option>
                                                    );
                                                })}
                                            </select>
                                            <label htmlFor="kabKota">Kab/Kota</label>
                                        </div>

                                        <div className="form-floating" style={{ width: "100%", paddingBottom: "5px"}}>
                                            <select
                                                name="rumahSakit"
                                                id="rumahSakit"
                                                typeof="select"
                                                className="form-select"
                                                onChange={e => rumahSakitChangeHandler(e)}
                                                >
                                                <option key={0} value={0}>Pilih</option>
                                                {daftarRumahSakit.map((nilai) => {
                                                    return (
                                                    <option
                                                        key={nilai.id}
                                                        value={nilai.id}
                                                    >
                                                        {nilai.nama}
                                                    </option>
                                                    );
                                                })}
                                            </select>
                                            <label htmlFor="rumahSakit">Rumah Sakit</label>
                                        </div>
                                    </>
                                ) : (
                                    <></>
                                )
                            }
                            {
                                user.jenisUserId === 3 ? (
                                    <>
                                        <div className="form-floating" style={{ width: "100%", paddingBottom: "5px"}}>
                                            <select
                                                name="rumahSakit"
                                                id="rumahSakit"
                                                typeof="select"
                                                className="form-select"
                                                onChange={e => rumahSakitChangeHandler(e)}
                                                >
                                                <option key={0} value={0}>Pilih</option>
                                                {daftarRumahSakit.map((nilai) => {
                                                    return (
                                                    <option
                                                        key={nilai.id}
                                                        value={nilai.id}
                                                    >
                                                        {nilai.nama}
                                                    </option>
                                                    );
                                                })}
                                            </select>
                                            <label htmlFor="rumahSakit">Rumah Sakit</label>
                                        </div>
                                    </>
                                ) : (
                                    <></>
                                )
                            }
                            <div className="form-floating" style={{ width: "70%", display: "inline-block" }}>
                                <select
                                    typeof="select"
                                    className="form-control"
                                    onChange={bulanChangeHandler}
                                >
                                    {daftarBulan.map((bulan) => {
                                        return (
                                            <option
                                                key={bulan.value}
                                                name={bulan.key}
                                                value={bulan.value}
                                            >
                                                {bulan.key}
                                            </option>
                                        );
                                    })}
                                </select>
                                <label>Bulan</label>
                            </div>
                            <div className="form-floating" style={{ width: "30%", display: "inline-block" }}>
                                <input name="tahun" type="number" className="form-control" id="tahun"
                                    placeholder="Tahun" value={tahun} onChange={e => tahunChangeHandler(e)} disabled={false} />
                                <label htmlFor="tahun">Tahun</label>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <div className="mt-3 mb-3">
                                <ToastContainer />
                                <button type="submit" className="btn btn-outline-success"><HiSaveAs size={20} /> Terapkan</button>
                            </div>
                        </Modal.Footer>
                    </form>
                </Modal>

                <div className="row">
                    <div className="col-md-12">
                        <div style={{marginBottom: "10px"}}>
                            {
                                user.jenisUserId === 4 ? (
                                        <Link className='btn' to={`/rl35/tambah/`} style={{ marginRight: "5px", fontSize: "18px", backgroundColor: "#779D9E", color: "#FFFFFF" }}>
                                            +
                                        </Link>
                                    
                                ) : (
                                    <></>
                                )
                            }
                            <button className='btn' style={{ fontSize: "18px", backgroundColor: "#779D9E", color: "#FFFFFF" }} onClick={handleShow}>
                                Filter
                            </button>
                        </div>
                        <div>
                            <h5 style={{fontSize: "14px"}}>
                                filtered by {filterLabel.map((value) => {
                                    return(
                                        value
                                    )
                                }).join(', ')}
                            </h5>
                        </div>
                        <Table className={style.rlTable}>
                            <thead>
                                <tr>
                                    <th style={{"width": "5%"}}>No.</th>
                                    <th style={{"width": "5%"}}>Aksi</th>
                                    <th style={{"width": "40%"}}>Jenis Kegiatan</th>
                                    <th>Kunjungan Pasien Dalam Kota</th>
                                    <th>Kunjungan Pasien Luar Kota</th>
                                    <th>Total Kunjungan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataRL.map((value, index) => {
                                    return (
                                        <tr key={value.id}>
                                            <td>
                                                <input type='text' name='id' className="form-control" value={index + 1} disabled={true}/>
                                            </td>
                                            <td style={{textAlign: "center", verticalAlign: "middle"}}>
                                                <ToastContainer />
                                                <div style={{display: "flex"}}>
                                                {/* <RiDeleteBin5Fill  size={20} onClick={(e) => hapus(value.id)} style={{color: "gray", cursor: "pointer", marginRight: "5px"}} /> */}
                                                    <button className="btn btn-danger" style={{margin: "0 5px 0 0", backgroundColor: "#FF6663", border: "1px solid #FF6663"}} type='button' onClick={(e) => hapus(value.id)}>Hapus</button>
                                                    <Link to={`/rl35/ubah/${value.id}`} className='btn btn-warning' style={{margin: "0 5px 0 0", backgroundColor: "#CFD35E", border: "1px solid #CFD35E", color:"#FFFFFF"}} >
                                                        Ubah
                                                    </Link>
                                                </div>
                                            </td>
                                            <td>
                                                <input type="text" name="jenisKegiatan" className="form-control" value={value.jenis_kegiatan_rl_tiga_titik_lima.nama} disabled={true} />
                                            </td>
                                            <td>
                                                <input type="text" name="kunjungan_pasien_dalam_kabkota" className="form-control" value={value.kunjungan_pasien_dalam_kabkota} 
                                                onChange={e => changeHandler(e, index)} disabled={true} />
                                            </td>
                                            <td>
                                                <input type="text" name="kunjungan_pasien_luar_kabkota" className="form-control" value={value.kunjungan_pasien_luar_kabkota} 
                                                onChange={e => changeHandler(e, index)} disabled={true} />
                                            </td>
                                            <td>
                                                <input type="text" name="total_kunjungan" className="form-control" value={value.total_kunjungan} 
                                                onChange={e => changeHandler(e, index)} disabled={true} />
                                            </td>
                                        </tr>
                                    )
                                }) }
                                {
                                    total_kunjungan != 0 ?(
                                        <tr>
                                            <td>
                                                <input type='text' name='id' className="form-control" value={99} disabled={true}/>
                                            </td>
                                            <td></td>
                                            <td>Total</td>
                                            <td>
                                                <input type="text" name="kunjungan_pasien_dalam_kabkota" className="form-control" value={total_kunjungan_pasien_dalam_kabkota} 
                                                disabled={true} />
                                            </td>
                                            <td>
                                                <input type="text" name="kunjungan_pasien_luar_kabkota" className="form-control" value={total_kunjungan_pasien_luar_kabkota} 
                                                disabled={true} />
                                            </td>
                                            <td>
                                                <input type="text" name="total_kunjungan" className="form-control" value={total_kunjungan} 
                                                disabled={true} />
                                            </td>
                                        </tr>
                                    ) : (
                                        <></>
                                    )
                                }
                            </tbody>
                        </Table>
                    </div>
                </div>
        </div>
    )
    
}

export default RL35