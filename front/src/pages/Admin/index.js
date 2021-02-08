import React, {useState, useEffect} from 'react';
import {useHistory} from 'react-router-dom';
import api from '../../services/api';
import { FaSignOutAlt , FaTrash , FaPencilAlt} from "react-icons/fa";
import "./styles.css";


function Admin(){
    const history = useHistory();
    const[users, setUsers] = useState([]);
    const adm = JSON.parse(localStorage.getItem("User"));
    
    async function getUsers(){
        try{
            const response = await api.get("/admin", {
                headers: { Authorization: adm._id}
            });
            setUsers(response.data.response);
        } catch(err) { console.log(err) }
    }

    function handleRegistration(){
        return history.push("/admin/new");
    } 

    function handleLogout(){
        localStorage.clear();
        return history.push("/");
    }

    async function handleDelete(_id){
        try{
                await api.delete("/admin", {
                headers: { Authorization: adm._id } , data :  {_id: _id} 
            })

            setUsers(users.filter( user => user._id !== _id));
        } catch (err) {console.log(err)}
    }

    async function handleResetAllBalance(){
        try{
                await api.put("/admin/zerarsaldo", {
                headers: { Authorization: adm._id } 
            })

            setUsers(users.map( user => {
                user.saldo = 0;
                return user;
            }));
        } catch (err) {console.log(err)}
    }

    async function handleIncreaseBalance(){
        try{
                await api.put("/admin/aumentarsaldo", {
                headers: { Authorization: adm._id }
            })

            setUsers(users.map( user => {
                let taxa = 1;
                if(user.month) taxa += 0.2;
                if(user.running) taxa += 0.1;
                user.saldo += (40 + (5*user.week))*taxa;
                return user;
            }));
        } catch (err) {console.log(err)}
    }

    function handleEdit(user){
        localStorage.setItem("userEdited", JSON.stringify(user));
        history.push("/admin/editUser");
    }

    useEffect(async () =>{
        if(adm === null) return history.push("chome://new-tab-page/");
        else await getUsers() 
    },[]);
    
    
    return(
        <div className="admin">
            <div className="header-admin">
                <h2>
                    Olá, {adm.name}
                </h2>
                <div className="buttons">
                    <button id="register" onClick={handleRegistration}> ADD USER</button>
                    <button id="logout" onClick={handleLogout}> <FaSignOutAlt size= "2rem"/> </button>
                </div>

                <button id="reset" onClick={handleResetAllBalance}>Zerar</button>
                <button id="increase" onClick={handleIncreaseBalance}>Incrementar Saldo</button>

            </div>
            <div className="users">
                <ul className="table">
                    {users.map(user => {
                        return(
                            <li>
                                <div className="user">
                                    <div className="user-buttons">
                                        <button id="edit" onClick={ ()=>{handleEdit(user)} }>
                                            <FaPencilAlt size="1rem" />
                                        </button>
                                        <button id="trash" onClick={ ()=>{handleDelete(user._id)} }>
                                            <FaTrash size="1rem" />
                                        </button>
                                    </div>
                                    <h4>{user.name}</h4>
                                    <h5>User Name: {user.userName}</h5>
                                    <h5>Saldo: {Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(user.saldo) }</h5>
                                    {user.running ? 
                                        <h5>Executando</h5>
                                        : <h5> Não está Executando</h5>
                                    }
                                    {user.month ?
                                        <h5>Vendeu projeto no mês</h5>
                                        : <h5> Não vendeu projeto no mês</h5>
                                    }
                                    <h5>Semanas com 10 horas: {user.week}</h5>
                                </div>
                            </li>
                        )
                    })}
                </ul>

            </div>
        </div>
    )
}
export default Admin;