import { useEffect } from "react";
import { useNavigate, Routes, Route } from 'react-router-dom';
import { Login, SignUp } from './User_Auth';
import { useAuth } from './Auth_Context';
import { Item_List} from './Item_Card';
import { supabase } from "./supabaseClient.tsx";
import './Item_Card.css'
import './App.css'


function NavBar() {
  const {user} = useAuth();

  const handleLogOut= async ()=>{
    const {error} = await supabase.auth.signOut(user?.email);
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
    if (!loading && !user && location.pathname != '/sign-up') {
        navigate('/');
      }
    if (user && location.pathname == '/sign-up') {
      navigate('/item-list');
    }
    }, [user, navigate]);

  return (
    <>
      { user && (<NavBar></NavBar>) }
      
      <div  style={{  backgroundImage: "linear-gradient(rgba(88, 88, 88, 0.01), rgba(88, 88, 88, 0.01)), url(https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/itemBackground.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        margin: "0",
        backgroundAttachment: "fixed"
      }}>
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/sign-up" element={<SignUp />}/>
          <Route path="/item-list" element={<Item_List />} />
        </Routes>
      </div>
    </>
  )
}

export default App
