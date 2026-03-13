import axios from 'axios'
import React, { useEffect, useState } from 'react'

export const GetApiDemo = () => {
    const [users, setusers] = useState([])

    const getUsers = async()=>{

        const res = await axios.get("https://node5.onrender.com/user/user/")
        console.log("response...",res);
        setusers(res.data.data)
    }
    //component --> load --> useEffec call --> function call..
    useEffect(()=>{
        //api logic..
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getUsers()
    },[])
  return (
    <div style={{textAlign:"center"}}>
        <h1>GET API DEMO</h1>
        {/* <button onClick={getUsers}>Get Users</button> */}
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user)=>(
                    <tr key={user._id}>
                        <td>{user._id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  )
}