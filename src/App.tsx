import { useEffect, useState } from "react";
import { useNavigate, Routes, Route, Link, Outlet } from 'react-router-dom';
import User_Auth from './User_Auth';
import { useAuth } from './Auth_Context';
import { Item_List} from './Item_Card';
import { supabase } from "./supabaseClient.tsx";
import './Item_Card.css'
import './App.css'


function NavBar() {
  const {user, loading} = useAuth();
  const navigate = useNavigate();
  const handleLogOut= async ()=>{
    //setLoading(true);
    const {data,error} = await supabase.auth.signOut(user?.email);
    //setLoading(false);
    if (error) {
      console.log(error);
    }
    else {
      console.log("Email: ", user?.email);
    }
  }

  return (
    <nav className="header">
      <div className="header-sec">
        
      </div>
      <div className="header-sec">
        <button className="header-btn" onClick={handleLogOut}>
          Log Out
        </button>
      </div>
    </nav>
  )
}
function App() {
  const {user, loading} = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
      if (!loading && !user) {
        navigate('/');
      }
    }, [user, navigate]);

  return (
    <>
      { user && (<NavBar></NavBar>) }
      
      <Routes>
        <Route path="/" element={<User_Auth />}/>
        <Route path="/item-list" element={<Item_List />} />
      </Routes>
    </>
  )
}

export default App
