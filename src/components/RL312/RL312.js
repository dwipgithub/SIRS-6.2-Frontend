import React, { useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";
import style from "./FormTambahRL312.module.css";
import { HiSaveAs } from "react-icons/hi";
import { confirmAlert } from "react-confirm-alert";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";

const RL312 = () => {
  const [tahun, setTahun] = useState("");
  const [filterLabel, setFilterLabel] = useState([]);
  const [rumahSakit, setRumahSakit] = useState("");
  const [daftarRumahSakit, setDaftarRumahSakit] = useState([]);
  const [daftarProvinsi, setDaftarProvinsi] = useState([]);
  const [daftarKabKota, setDaftarKabKota] = useState([]);
  const [dataRL, setDataRL] = useState([]);
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [show, setShow] = useState(false);
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const [totalkhusus, settotalkhusus] = useState(0);
  const [totalbesar, settotalbesar] = useState(0);
  const [totalsedang, settotalsedang] = useState(0);
  const [totalkecil, settotalkecil] = useState(0);
  const [totalall, settotalall] = useState(0);

  useEffect(() => {
    refreshToken();
    const getLastYear = async () => {
      const date = new Date();
      setTahun(date.getFullYear() - 1);
      return date.getFullYear() - 1;
    };
    getLastYear().then((results) => {
      // getDataRLTigaTitikDuaBelas(results);
    });
    // getRLTigaTitikTigaTemplate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axios.get("/apisirs6v2/token");
      setToken(response.data.accessToken);
      const decoded = jwt_decode(response.data.accessToken);
      showRumahSakit(decoded.satKerId);
      setExpire(decoded.exp);
      setUser(decoded);
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

  const axiosJWT = axios.create();
  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date();
      if (expire * 1000 < currentDate.getTime()) {
        const response = await axios.get("/apisirs6v2/token");
        config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        setToken(response.data.accessToken);
        const decoded = jwt_decode(response.data.accessToken);
        setExpire(decoded.exp);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const tahunChangeHandler = (event) => {
    setTahun(event.target.value);
  };
  const provinsiChangeHandler = (e) => {
    const provinsiId = e.target.value;
    getKabKota(provinsiId);
  };

  const kabKotaChangeHandler = (e) => {
    const kabKotaId = e.target.value;
    getRumahSakit(kabKotaId);
  };

  const rumahSakitChangeHandler = (e) => {
    const rsId = e.target.value;
    showRumahSakit(rsId);
  };

  const getRumahSakit = async (kabKotaId) => {
    try {
      const response = await axiosJWT.get("/apisirs6v2/rumahsakit/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          kabKotaId: kabKotaId,
        },
      });
      setDaftarRumahSakit(response.data.data);
    } catch (error) {}
  };

  const showRumahSakit = async (id) => {
    try {
      const response = await axiosJWT.get("/apisirs6v2/rumahsakit/" + id, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRumahSakit(response.data.data);
    } catch (error) {}
  };

  const getRL = async (e) => {
    e.preventDefault();
    if (rumahSakit == null) {
      toast(`rumah sakit harus dipilih`, {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }
    const filter = [];
    filter.push("nama: ".concat(rumahSakit.nama));
    filter.push("periode: ".concat(String(tahun)));
    setFilterLabel(filter);
    try {
      const customConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: {
          rsId: rumahSakit.id,
          periode: String(tahun),
        },
      };
      const results = await axiosJWT.get(
        "/apisirs6v2/rltigatitikduabelas",
        customConfig
      );

      const rlTigaTitikDuaBelasDetails = results.data.data.map((value) => {
        return value;
      });

      let dataRLTigaTitikDuaBelasDetails = [];
      let totalKhusus = 0;
      let totalBesar = 0;
      let totalKecil = 0;
      let totalSedang = 0;
      rlTigaTitikDuaBelasDetails.forEach((element) => {
        // element.forEach((value) => {
        totalKhusus += element.khusus;
        totalBesar += element.besar;
        totalSedang += element.sedang;
        totalKecil += element.kecil;
        dataRLTigaTitikDuaBelasDetails.push(element);
        // });
      });
      // console.log(dataRLTigaTitikDuaBelasDetails);
      let totalALL = totalKhusus + totalBesar + totalSedang + totalKecil;
      settotalkhusus(totalKhusus);
      settotalbesar(totalBesar);
      settotalsedang(totalSedang);
      settotalkecil(totalKecil);
      settotalall(totalALL);
      // setDataRL(dataRLTigaTitikDuaBelasDetails);

      setDataRL(rlTigaTitikDuaBelasDetails);
      setRumahSakit(null);
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteRL = async (id) => {
    const customConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      await axiosJWT.delete(
        `/apisirs6v2/rltigatitikduabelas/${id}`,
        customConfig
      );
      toast("Data Berhasil Dihapus", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setDataRL((current) => current.filter((value) => value.id !== id));
    } catch (error) {
      console.log(error);
      toast("Data Gagal Disimpan", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const deleteConfirmation = (id) => {
    confirmAlert({
      title: "",
      message: "Yakin data yang dipilih akan dihapus? ",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            deleteRL(id);
          },
        },
        {
          label: "No",
        },
      ],
    });
  };

  const handleClose = () => setShow(false);

  const handleShow = () => {
    const jenisUserId = user.jenisUserId;
    const satKerId = user.satKerId;
    switch (jenisUserId) {
      case 1:
        getProvinsi();
        setShow(true);
        break;
      case 2:
        getKabKota(satKerId);
        setShow(true);
        break;
      case 3:
        getRumahSakit(satKerId);
        setShow(true);
        break;
      case 4:
        showRumahSakit(satKerId);
        setShow(true);
        break;
      default:
    }
  };

  const getProvinsi = async () => {
    try {
      const customConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const results = await axiosJWT.get("/apisirs6v2/provinsi", customConfig);

      const daftarProvinsi = results.data.data.map((value) => {
        return value;
      });

      setDaftarProvinsi(daftarProvinsi);
    } catch (error) {
      console.log(error);
    }
  };

  const getKabKota = async (provinsiId) => {
    try {
      const customConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: {
          provinsiId: provinsiId,
        },
      };
      const results = await axiosJWT.get("/apisirs6v2/kabkota", customConfig);

      const daftarKabKota = results.data.data.map((value) => {
        return value;
      });

      setDaftarKabKota(daftarKabKota);
    } catch (error) {
      console.log(error);
    }
  };

  const changeHandler = (event, index) => {
    let newDataRL = [...dataRL];
    const name = event.target.name;
    if (name === "check") {
      if (event.target.checked === true) {
        newDataRL[index].disabledInput = false;
      } else if (event.target.checked === false) {
        newDataRL[index].disabledInput = true;
      }
      newDataRL[index].checked = event.target.checked;
    } else if (name === "Total") {
      newDataRL[index].Total = event.target.value;
    } else if (name === "Khusus") {
      newDataRL[index].Khusus = event.target.value;
    } else if (name === "Besar") {
      newDataRL[index].Besar = event.target.value;
    } else if (name === "Sedang") {
      newDataRL[index].Sedang = event.target.value;
    } else if (name === "Kecil") {
      newDataRL[index].Kecil = event.target.value;
    }
    setDataRL(newDataRL);
  };

  return (
    <div className="container" style={{ marginTop: "70px" }}>
      <Modal show={show} onHide={handleClose} style={{ position: "fixed" }}>
        <Modal.Header closeButton>
          <Modal.Title>Filter</Modal.Title>
        </Modal.Header>

        <form onSubmit={getRL}>
          <Modal.Body>
            {user.jenisUserId === 1 ? (
              <>
                <div
                  className="form-floating"
                  style={{ width: "100%", paddingBottom: "5px" }}
                >
                  <select
                    name="provinsi"
                    id="provinsi"
                    typeof="select"
                    className="form-select"
                    onChange={(e) => provinsiChangeHandler(e)}
                  >
                    <option key={0} value={0}>
                      Pilih
                    </option>
                    {daftarProvinsi.map((nilai) => {
                      return (
                        <option key={nilai.id} value={nilai.id}>
                          {nilai.nama}
                        </option>
                      );
                    })}
                  </select>
                  <label htmlFor="provinsi">Provinsi</label>
                </div>

                <div
                  className="form-floating"
                  style={{ width: "100%", paddingBottom: "5px" }}
                >
                  <select
                    name="kabKota"
                    id="kabKota"
                    typeof="select"
                    className="form-select"
                    onChange={(e) => kabKotaChangeHandler(e)}
                  >
                    <option key={0} value={0}>
                      Pilih
                    </option>
                    {daftarKabKota.map((nilai) => {
                      return (
                        <option key={nilai.id} value={nilai.id}>
                          {nilai.nama}
                        </option>
                      );
                    })}
                  </select>
                  <label htmlFor="kabKota">Kab/Kota</label>
                </div>

                <div
                  className="form-floating"
                  style={{ width: "100%", paddingBottom: "5px" }}
                >
                  <select
                    name="rumahSakit"
                    id="rumahSakit"
                    typeof="select"
                    className="form-select"
                    onChange={(e) => rumahSakitChangeHandler(e)}
                  >
                    <option key={0} value={0}>
                      Pilih
                    </option>
                    {daftarRumahSakit.map((nilai) => {
                      return (
                        <option key={nilai.id} value={nilai.id}>
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
            )}
            {user.jenisUserId === 2 ? (
              <>
                <div
                  className="form-floating"
                  style={{ width: "100%", paddingBottom: "5px" }}
                >
                  <select
                    name="kabKota"
                    id="kabKota"
                    typeof="select"
                    className="form-select"
                    onChange={(e) => kabKotaChangeHandler(e)}
                  >
                    <option key={0} value={0}>
                      Pilih
                    </option>
                    {daftarKabKota.map((nilai) => {
                      return (
                        <option key={nilai.id} value={nilai.id}>
                          {nilai.nama}
                        </option>
                      );
                    })}
                  </select>
                  <label htmlFor="kabKota">Kab/Kota</label>
                </div>

                <div
                  className="form-floating"
                  style={{ width: "100%", paddingBottom: "5px" }}
                >
                  <select
                    name="rumahSakit"
                    id="rumahSakit"
                    typeof="select"
                    className="form-select"
                    onChange={(e) => rumahSakitChangeHandler(e)}
                  >
                    <option key={0} value={0}>
                      Pilih
                    </option>
                    {daftarRumahSakit.map((nilai) => {
                      return (
                        <option key={nilai.id} value={nilai.id}>
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
            )}
            {user.jenisUserId === 3 ? (
              <>
                <div
                  className="form-floating"
                  style={{ width: "100%", paddingBottom: "5px" }}
                >
                  <select
                    name="rumahSakit"
                    id="rumahSakit"
                    typeof="select"
                    className="form-select"
                    onChange={(e) => rumahSakitChangeHandler(e)}
                  >
                    <option key={0} value={0}>
                      Pilih
                    </option>
                    {daftarRumahSakit.map((nilai) => {
                      return (
                        <option key={nilai.id} value={nilai.id}>
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
            )}
            <div
              className="form-floating"
              style={{ width: "100%", display: "inline-block" }}
            >
              <input
                name="tahun"
                type="number"
                className="form-control"
                id="tahun"
                placeholder="Tahun"
                value={tahun}
                onChange={(e) => tahunChangeHandler(e)}
                disabled={false}
              />
              <label htmlFor="tahun">Tahun</label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="mt-3 mb-3">
              <ToastContainer />
              <button type="submit" className="btn btn-outline-success">
                <HiSaveAs size={20} /> Terapkan
              </button>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
      <div className="row">
        <div className="col-md-12">
          <div style={{ marginBottom: "10px" }}>
            {user.jenisUserId === 4 ? (
              <Link
                className="btn"
                to={`/rl312/tambah/`}
                style={{
                  marginRight: "5px",
                  fontSize: "18px",
                  backgroundColor: "#779D9E",
                  color: "#FFFFFF",
                }}
              >
                +
              </Link>
            ) : (
              <></>
            )}
            <button
              className="btn"
              style={{
                fontSize: "18px",
                backgroundColor: "#779D9E",
                color: "#FFFFFF",
              }}
              onClick={handleShow}
            >
              Filter
            </button>
          </div>

          <div>
            <h5 style={{ fontSize: "14px" }}>
              filtered by{" "}
              {filterLabel
                .map((value) => {
                  return value;
                })
                .join(", ")}
            </h5>
          </div>
          <Table
            className={style.rlTable}
            striped
            responsive
            style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th style={{ width: "2%" }}>No.</th>
                <th style={{ width: "2%" }}></th>
                <th style={{ width: "10%" }}>Jenis Spesialisasi</th>
                <th style={{ width: "5%" }}>Khusus</th>
                <th style={{ width: "5%" }}>Besar</th>
                <th style={{ width: "5%" }}>Sedang</th>
                <th style={{ width: "5%" }}>Kecil</th>
                <th style={{ width: "5%" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {dataRL.map((value, index) => {
                return (
                  <tr key={value.id}>
                    <td>
                      <input
                        type="text"
                        name="id"
                        className="form-control"
                        value={index + 1}
                        disabled={true}
                        style={{ textAlign: "center" }}
                      />
                    </td>
                    <td
                      style={{ textAlign: "center", verticalAlign: "middle" }}
                    >
                      <ToastContainer />
                      {/* <RiDeleteBin5Fill  size={20} onClick={(e) => hapus(value.id)} style={{color: "gray", cursor: "pointer", marginRight: "5px"}} /> */}
                      {user.jenisUserId === 4 ? (
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <button
                            className="btn btn-danger"
                            style={{
                              margin: "0 5px 0 0",
                              backgroundColor: "#FF6663",
                              border: "1px solid #FF6663",
                            }}
                            type="button"
                            onClick={(e) => deleteConfirmation(value.id)}
                          >
                            Hapus
                          </button>
                          <Link
                            to={`/rl312/edit/${value.id}`}
                            className="btn btn-warning"
                            style={{
                              margin: "0 5px 0 0",
                              backgroundColor: "#CFD35E",
                              border: "1px solid #CFD35E",
                              color: "#FFFFFF",
                            }}
                          >
                            Ubah
                          </Link>
                        </div>
                      ) : (
                        <></>
                      )}
                    </td>
                    <td>
                      <input
                        type="text"
                        name="jenisSpesialisasi"
                        className="form-control"
                        value={value.nama_spesialisasi}
                        disabled={true}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="khusus"
                        className="form-control"
                        value={value.khusus}
                        disabled={true}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="besar"
                        className="form-control"
                        value={value.besar}
                        disabled={true}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="sedang"
                        className="form-control"
                        value={value.sedang}
                        disabled={true}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="kecil"
                        className="form-control"
                        value={value.kecil}
                        disabled={true}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="total"
                        className="form-control"
                        value={value.total}
                        disabled={true}
                      />
                    </td>
                  </tr>
                );
              })}

              {dataRL.length > 0 ? (
                <tr>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <h6>99</h6>
                  </td>
                  <td></td>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <h6>TOTAL</h6>
                  </td>
                  <td>
                    <input
                      type="text"
                      name="totalKhusus"
                      className="form-control"
                      value={totalkhusus}
                      disabled={true}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="totalBesar"
                      className="form-control"
                      value={totalbesar}
                      disabled={true}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="totalSedang"
                      className="form-control"
                      value={totalsedang}
                      disabled={true}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="totalKecil"
                      className="form-control"
                      value={totalkecil}
                      disabled={true}
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      name="totalAll"
                      className="form-control"
                      value={totalall}
                      disabled={true}
                    />
                  </td>
                </tr>
              ) : (
                <></>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default RL312;
