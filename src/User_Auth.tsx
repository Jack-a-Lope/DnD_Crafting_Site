import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./User_Auth.css";
import "./Item_Card.css";
import {useAuth} from "./Auth_Context";
import { supabase } from "./supabaseClient";

function User_Auth() {
  const [email,setEmail]=useState("");
  const [password , setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/item-list');
    }
  }, [user, navigate]);

  const handleSignUp = async ()=>{
    setError("");
    setLoading(true);
    const {data,error} = await supabase.auth.signUp({email,password});
    setLoading(false);
    if (error) return setError(error.message);
  }

  const handleLogin = async ()=>{
    setError("");
    setLoading(true);
    const {data,error} = await supabase.auth.signInWithPassword({email,password});
    setLoading(false);
    if (error) return setError(error.message);
  }


  const handleLogOut= async ()=>{
    setError("");
    setLoading(true);
    const {data,error} = await supabase.auth.signOut({email,password});
    setLoading(false);
    if (error) return setError(error.message);
  }

  if (user) return null;

  return (
    <>
        <div className="background-img">
            <div className="login-container">
                <div className="login-card">
                    <h2>Login or Sign Up</h2>
                    {error && <p style={{color:'#922610'}}>{error}</p>}
                    {loading?
                        <p>
                            "Please wait ..."
                        </p>
                    :
                        ""}
                
                    <input
                        type="email"
                        className="login-input"
                        placeholder="Email"
                        value={email}
                        onChange={e=>setEmail(e.target.value)}
                    />
                    <input
                        className="login-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e=>setPassword(e.target.value)}
                    />
                    <div className="login-row-inline">
                        <button className="menu-btn-submit"
                            onClick={handleLogin}
                            disabled={loading || !email || !password }
                        >
                            Login
                        </button>
                        <button className="menu-btn-submit"
                                onClick={handleSignUp}
                                disabled={loading || !email || !password}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>
    
  );
}

export default User_Auth;