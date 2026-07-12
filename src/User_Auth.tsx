import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./User_Auth.css";
import "./Item_Card.css";
import {useAuth} from "./Auth_Context";
import { supabase } from "./supabaseClient";

function Login() {
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

  const handleLogin = async ()=>{
    setError("");
    setLoading(true);
    const {error} = await supabase.auth.signInWithPassword({email,password});
    setLoading(false);
    if (error) return setError(error.message);
  }

  if (user) return null;

  return (
    <>
        <div className="background-img">
            <div className="login-container">
                <div className="login-card">
                    <h2>Login</h2>
                    {error && <p style={{color:'#922610'}}>{error}</p>}
                    {loading?<p>"Please wait ..."</p>:""}
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
                                onClick={() => navigate('/sign-up')}
                                disabled={loading}
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

function SignUp() {
    const [email,setEmail]=useState("");
    const [password , setPassword]=useState("");
    const [error, setError]=useState("");
    const [loading,setLoading]=useState(false);
    const navigate = useNavigate();

    const handleSignUp = async ()=>{
        setError("");
        setLoading(true);
        const {error} = await supabase.auth.signUp({email,password});
        setLoading(false);
        if (error) {
            return setError(error.message);
        } else {
            return setError("Please Confirm Email");
        }

    }

    return(
        <>
        <div className="background-img">
            <div className="login-container">
                <div className="login-card">
                    <h2>Sign Up</h2>
                    {error && <p style={{color:'#922610'}}>{error}</p>}
                    {loading?<p>"Please wait ..."</p>:""}
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
                            style={{backgroundColor:'#3d3d3d', outlineColor: '#3d3d3d', borderColor: '#3d3d3d'}}
                            onClick={() => navigate('/')}
                            disabled={loading}
                        >
                            Back
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

export {Login, SignUp};